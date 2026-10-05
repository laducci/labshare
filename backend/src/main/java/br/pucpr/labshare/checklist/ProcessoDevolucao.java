/*
 * ============================================================
 *  ProcessoDevolucao.java  |  Camada: Service (fluxo de empréstimo - subclasse)
 *  Responsável na apresentação: Laura  |  Atividade: Q1 (Template Method 2 de 3 + usa Strategy CalculoMulta), Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: preenche os passos variáveis do ProcessoChecklist para a
 *  DEVOLUÇÃO: finaliza a reserva, faz a inspeção (RN07); se houver defeito,
 *  cria uma ocorrência (RN08) e manda o equipamento para manutenção (RN09).
 *  No gancho final calcula a multa por atraso com a estratégia do cliente.
 *  Quem chama: EmprestimoController -> POST /api/emprestimos/{reservaId}/devolucao
 *              (tela RegisterReturn, botão de confirmar a devolução).
 *  Chama: OcorrenciaDao, MultaDao, SeletorDeRegras, EquipamentoService, HistoricoService.
 * ============================================================
 */
package br.pucpr.labshare.checklist;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.MultaDao;
import br.pucpr.labshare.dao.OcorrenciaDao;
import br.pucpr.labshare.dao.ReservaDao;
import br.pucpr.labshare.dto.ChecklistRequest;
import br.pucpr.labshare.dto.ResultadoChecklist;
import br.pucpr.labshare.model.Equipamento;
import br.pucpr.labshare.model.ItemChecklist;
import br.pucpr.labshare.model.Multa;
import br.pucpr.labshare.model.Ocorrencia;
import br.pucpr.labshare.model.Reserva;
import br.pucpr.labshare.service.EquipamentoService;
import br.pucpr.labshare.service.HistoricoService;
import br.pucpr.labshare.variabilidade.CalculoMulta;
import br.pucpr.labshare.variabilidade.SeletorDeRegras;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/** Template Method concreto: devolução + inspeção (storyboard, quadro 16). */
// @Component: o Spring cria este objeto e o injeta no EmprestimoController.
@Component
public class ProcessoDevolucao extends ProcessoChecklist {

    private final OcorrenciaDao ocorrenciaDao;
    private final MultaDao multaDao;
    private final SeletorDeRegras seletor;

    // Injeção pelo construtor: as 3 primeiras dependências vão para a classe-mãe (super),
    // as outras são específicas da devolução (ocorrência, multa e escolha da Strategy).
    public ProcessoDevolucao(ReservaDao reservaDao, EquipamentoService equipamentos, HistoricoService historico,
                             OcorrenciaDao ocorrenciaDao, MultaDao multaDao, SeletorDeRegras seletor) {
        super(reservaDao, equipamentos, historico);
        this.ocorrenciaDao = ocorrenciaDao;
        this.multaDao = multaDao;
        this.seletor = seletor;
    }

    // Passo abstrato: nome do processo (usado no histórico e nas observações).
    @Override
    protected String tipo() {
        return "devolução";
    }

    /** RN07 + RN08 + RN09: inspeção; defeito gera ocorrência e manda para manutenção. */
    @Override
    protected void aplicar(Reserva reserva, Equipamento equipamento, ChecklistRequest pedido,
                           Contexto ctx, ResultadoChecklist resultado) {
        // Se a tela não mandou data, considera devolvido hoje. finalizar() exige reserva "Em uso".
        LocalDate dataEntrega = pedido.getDataDevolucao() != null ? pedido.getDataDevolucao() : LocalDate.now();
        reserva.finalizar(dataEntrega);

        // Inspeção (RN07): separa os itens que o técnico marcou com defeito.
        List<ItemChecklist> comDefeito = pedido.getItens().stream().filter(ItemChecklist::temDefeito).toList();

        // Sem defeito: o equipamento volta a "Disponível" (ou "Reservado", se houver outra reserva na fila).
        if (comDefeito.isEmpty()) {
            equipamento.liberar(equipamentos.possuiOutrasReservas(equipamento.getId(), reserva.getId(), ctx));
            resultado.setMensagem("Devolução registrada sem defeitos. " + equipamento.getNome() + " está liberado.");
            return;
        }

        // RN08: com defeito -> monta e grava uma ocorrência (INSERT INTO ocorrencia ...) ligada à reserva.
        Ocorrencia ocorrencia = new Ocorrencia();
        ocorrencia.setTenantId(ctx.tenantId());
        ocorrencia.setEquipamentoId(equipamento.getId());
        ocorrencia.setReservaId(reserva.getId());
        ocorrencia.setPrioridade(pedido.getPrioridade() == null ? "Média" : pedido.getPrioridade());
        String itens = comDefeito.stream().map(ItemChecklist::getItem).collect(Collectors.joining(", "));
        ocorrencia.setDescricao(pedido.getObservacoes() != null && !pedido.getObservacoes().isBlank()
                ? pedido.getObservacoes() + " (itens: " + itens + ")"
                : "Defeito identificado na devolução: " + itens);
        ocorrenciaDao.inserir(ocorrencia);

        // RN09: equipamento sai de circulação ("Em manutenção"); o status é gravado no passo 5 do template.
        equipamento.enviarParaManutencao();
        historico.registrar(ctx, "ocorrencia", ocorrencia.getId(), "CRIACAO", ocorrencia.getDescricao());
        resultado.setOcorrencia(ocorrenciaDao.buscarPorId(ocorrencia.getId(), ctx.tenantId()).orElse(ocorrencia));
        resultado.setMensagem("Defeito registrado. " + equipamento.getNome() + " foi encaminhado para manutenção.");
    }

    /** Gancho: VARIABILIDADE - a estratégia de multa do cliente decide se cobra o atraso. */
    // Aqui os dois padrões trabalham juntos: o Template Method chama o gancho e o gancho usa uma Strategy.
    @Override
    protected void depoisDeConcluir(Reserva reserva, Equipamento equipamento, Contexto ctx, ResultadoChecklist resultado) {
        long diasAtraso = reserva.calcularDiasDeAtraso(reserva.getDataDevolucao());
        // SemMulta devolve 0; MultaPorDiaDeAtraso devolve valor diário x dias (depende do recurso lateFee).
        CalculoMulta calculo = seletor.para(ctx.tenantId()).multa();      // Strategy
        BigDecimal valor = calculo.calcular(diasAtraso);

        // Só grava multa se o valor for maior que zero (compareTo é como se compara BigDecimal).
        if (valor.compareTo(BigDecimal.ZERO) > 0) {
            Multa multa = new Multa();
            multa.setTenantId(ctx.tenantId());
            multa.setReservaId(reserva.getId());
            multa.setDiasAtraso((int) diasAtraso);
            multa.setValor(valor);
            multaDao.inserir(multa);   // INSERT INTO multa ...
            historico.registrar(ctx, "multa", multa.getId(), "CRIACAO",
                    "Multa de R$ " + valor + " por " + diasAtraso + " dia(s) de atraso");
            resultado.setMulta(multaDao.buscarPorId(multa.getId(), ctx.tenantId()).orElse(multa));
        }
    }
}
