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
@Component
public class ProcessoDevolucao extends ProcessoChecklist {

    private final OcorrenciaDao ocorrenciaDao;
    private final MultaDao multaDao;
    private final SeletorDeRegras seletor;

    public ProcessoDevolucao(ReservaDao reservaDao, EquipamentoService equipamentos, HistoricoService historico,
                             OcorrenciaDao ocorrenciaDao, MultaDao multaDao, SeletorDeRegras seletor) {
        super(reservaDao, equipamentos, historico);
        this.ocorrenciaDao = ocorrenciaDao;
        this.multaDao = multaDao;
        this.seletor = seletor;
    }

    @Override
    protected String tipo() {
        return "devolução";
    }

    /** RN07 + RN08 + RN09: inspeção; defeito gera ocorrência e manda para manutenção. */
    @Override
    protected void aplicar(Reserva reserva, Equipamento equipamento, ChecklistRequest pedido,
                           Contexto ctx, ResultadoChecklist resultado) {
        LocalDate dataEntrega = pedido.getDataDevolucao() != null ? pedido.getDataDevolucao() : LocalDate.now();
        reserva.finalizar(dataEntrega);

        List<ItemChecklist> comDefeito = pedido.getItens().stream().filter(ItemChecklist::temDefeito).toList();

        if (comDefeito.isEmpty()) {
            equipamento.liberar(equipamentos.possuiOutrasReservas(equipamento.getId(), reserva.getId(), ctx));
            resultado.setMensagem("Devolução registrada sem defeitos. " + equipamento.getNome() + " está liberado.");
            return;
        }

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

        equipamento.enviarParaManutencao();
        historico.registrar(ctx, "ocorrencia", ocorrencia.getId(), "CRIACAO", ocorrencia.getDescricao());
        resultado.setOcorrencia(ocorrenciaDao.buscarPorId(ocorrencia.getId(), ctx.tenantId()).orElse(ocorrencia));
        resultado.setMensagem("Defeito registrado. " + equipamento.getNome() + " foi encaminhado para manutenção.");
    }

    /** Gancho: VARIABILIDADE - a estratégia de multa do cliente decide se cobra o atraso. */
    @Override
    protected void depoisDeConcluir(Reserva reserva, Equipamento equipamento, Contexto ctx, ResultadoChecklist resultado) {
        long diasAtraso = reserva.calcularDiasDeAtraso(reserva.getDataDevolucao());
        CalculoMulta calculo = seletor.para(ctx.tenantId()).multa();      // Strategy
        BigDecimal valor = calculo.calcular(diasAtraso);

        if (valor.compareTo(BigDecimal.ZERO) > 0) {
            Multa multa = new Multa();
            multa.setTenantId(ctx.tenantId());
            multa.setReservaId(reserva.getId());
            multa.setDiasAtraso((int) diasAtraso);
            multa.setValor(valor);
            multaDao.inserir(multa);
            historico.registrar(ctx, "multa", multa.getId(), "CRIACAO",
                    "Multa de R$ " + valor + " por " + diasAtraso + " dia(s) de atraso");
            resultado.setMulta(multaDao.buscarPorId(multa.getId(), ctx.tenantId()).orElse(multa));
        }
    }
}
