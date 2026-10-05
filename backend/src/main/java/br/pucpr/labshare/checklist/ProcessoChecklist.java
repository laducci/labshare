/*
 * ============================================================
 *  ProcessoChecklist.java  |  Camada: Service (fluxo de empréstimo - classe abstrata)
 *  Responsável na apresentação: Laura  |  Atividade: Q1 (Template Method 2 de 3), Q3 (reuso: um esqueleto, dois fluxos)
 * ------------------------------------------------------------
 *  O que faz: esqueleto comum da RETIRADA e da DEVOLUÇÃO de equipamento com
 *  checklist. Carrega reserva e equipamento, valida os itens, deixa a subclasse
 *  mudar os status, grava tudo no banco e registra o histórico (RN11/RNF10).
 *  Quem chama: EmprestimoController (POST /api/emprestimos/{reservaId}/retirada
 *              e /devolucao), a partir das telas RegisterPickup e RegisterReturn.
 *  Chama: ReservaDao, EquipamentoService, HistoricoService.
 * ============================================================
 */
package br.pucpr.labshare.checklist;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.ReservaDao;
import br.pucpr.labshare.dto.ChecklistRequest;
import br.pucpr.labshare.dto.ResultadoChecklist;
import br.pucpr.labshare.exception.NaoEncontradoException;
import br.pucpr.labshare.exception.RegraNegocioException;
import br.pucpr.labshare.model.Equipamento;
import br.pucpr.labshare.model.ItemChecklist;
import br.pucpr.labshare.model.Reserva;
import br.pucpr.labshare.service.EquipamentoService;
import br.pucpr.labshare.service.HistoricoService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ============================================================
 *  PADRÃO DE PROJETO: TEMPLATE METHOD  (exemplo 2 de 3)
 * ============================================================
 * Retirada e devolução são o MESMO processo com pequenas diferenças
 * (no handoff: "o mesmo componente de Checklist é usado nos dois momentos,
 *  a diferença está apenas na configuração").
 *
 * Roteiro fixo, definido em executar() (final):
 *   1. carregar a reserva e o equipamento        (comum)
 *   2. validar a lista de itens                  (comum)
 *   3. validarConferencia(...)                   (GANCHO - a retirada exige tudo OK)
 *   4. aplicar(...)                              (ABSTRATO - o que muda de verdade)
 *   5. gravar reserva e status do equipamento    (comum)
 *   6. registrar o checklist no histórico        (comum)
 *   7. depoisDeConcluir(...)                     (GANCHO - a devolução calcula multa)
 *
 * Subclasses: ProcessoRetirada e ProcessoDevolucao.
 * Reuso: o mesmo esqueleto serve para vistoria de veículos, entrega de chaves de sala etc.
 */
// "abstract": não dá para instanciar esta classe; só as subclasses (que são @Component) viram beans do Spring.
public abstract class ProcessoChecklist {

    // "protected": as subclasses também enxergam estas dependências (ex.: historico na devolução).
    protected final ReservaDao reservaDao;
    protected final EquipamentoService equipamentos;
    protected final HistoricoService historico;

    // Recebe as dependências pelo construtor; as subclasses repassam via super(...).
    protected ProcessoChecklist(ReservaDao reservaDao, EquipamentoService equipamentos, HistoricoService historico) {
        this.reservaDao = reservaDao;
        this.equipamentos = equipamentos;
        this.historico = historico;
    }

    /** MÉTODO-TEMPLATE. */
    // "final": nenhuma subclasse pode reescrever a ORDEM dos passos, só preencher os passos variáveis.
    // Chamado por EmprestimoController (botão "Confirmar retirada"/"Confirmar devolução" no front).
    public final ResultadoChecklist executar(Long reservaId, ChecklistRequest pedido, Contexto ctx) {
        // 1. carregar
        // Busca a reserva só dentro do cliente logado (tenantId); se não existir -> 404.
        Reserva reserva = reservaDao.buscarPorId(reservaId, ctx.tenantId())
                .orElseThrow(() -> new NaoEncontradoException("Reserva", reservaId));
        Equipamento equipamento = equipamentos.buscar(reserva.getEquipamentoId(), ctx);

        // 2. validação comum
        // RN05 / RN07: sem checklist não há retirada nem devolução.
        List<ItemChecklist> itens = pedido.getItens();
        if (itens == null || itens.isEmpty()) {
            throw new RegraNegocioException("O checklist precisa ter pelo menos um item.");
        }

        // 3. gancho
        validarConferencia(itens);

        // 4. passo específico
        // tipo() e aplicar() são abstratos: cada subclasse diz o que fazer aqui.
        ResultadoChecklist resultado = new ResultadoChecklist(tipo());
        aplicar(reserva, equipamento, pedido, ctx, resultado);

        // 5. gravar
        // UPDATE na reserva (status, datas, observações) e UPDATE só do status do equipamento.
        reserva.setObservacoes(juntarObservacoes(reserva.getObservacoes(), pedido, itens));
        reservaDao.atualizar(reserva);
        equipamentos.salvarStatus(equipamento);

        // 6. rastreabilidade
        // RN11 / RNF10: grava no histórico o checklist e a mudança de status do equipamento.
        String resumo = itens.stream().map(ItemChecklist::toString).collect(Collectors.joining("; "));
        historico.registrar(ctx, "reserva", reserva.getId(), tipo().toUpperCase(), "Checklist de " + tipo() + ": " + resumo);
        historico.registrar(ctx, "equipamento", equipamento.getId(), tipo().toUpperCase(),
                "Status alterado para " + equipamento.getStatus().getRotulo());

        // 7. gancho
        depoisDeConcluir(reserva, equipamento, ctx, resultado);

        // Relê do banco para devolver ao front os dados já atualizados (JSON da resposta).
        resultado.setReserva(reservaDao.buscarPorId(reservaId, ctx.tenantId()).orElse(reserva));
        resultado.setEquipamento(equipamentos.buscar(equipamento.getId(), ctx));
        return resultado;
    }

    // ---------- passos que variam ----------

    /** "retirada" ou "devolução" */
    protected abstract String tipo();

    /** Muda o status da reserva e do equipamento. */
    protected abstract void aplicar(Reserva reserva, Equipamento equipamento, ChecklistRequest pedido,
                                    Contexto ctx, ResultadoChecklist resultado);

    // ---------- ganchos (padrão: não fazem nada) ----------

    // Gancho opcional: a retirada sobrescreve para exigir todos os itens OK (RN05).
    protected void validarConferencia(List<ItemChecklist> itens) {}

    // Gancho opcional: a devolução sobrescreve para calcular multa (Strategy CalculoMulta).
    protected void depoisDeConcluir(Reserva reserva, Equipamento equipamento, Contexto ctx, ResultadoChecklist resultado) {}

    // Acrescenta às observações da reserva uma linha "[retirada] itens... | Obs.: ...", sem apagar as anteriores.
    private String juntarObservacoes(String anteriores, ChecklistRequest pedido, List<ItemChecklist> itens) {
        String nova = "[" + tipo() + "] " + itens.stream().map(ItemChecklist::toString).collect(Collectors.joining(", "))
                + (pedido.getObservacoes() == null || pedido.getObservacoes().isBlank() ? "" : " | Obs.: " + pedido.getObservacoes());
        return anteriores == null || anteriores.isBlank() ? nova : anteriores + "\n" + nova;
    }
}
