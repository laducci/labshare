package br.pucpr.labshare.variabilidade;

import br.pucpr.labshare.model.StatusReserva;

/**
 * ============================================================
 *  PADRÃO DE PROJETO: STRATEGY  (exemplo 1 de 3) - interface
 * ============================================================
 * Pergunta que varia de cliente para cliente:
 *   "Depois que o aluno confirma, a reserva já fica agendada ou precisa de aprovação?"
 *
 * Cada resposta é uma ESTRATÉGIA (classe) diferente que implementa esta interface:
 *   - AprovacaoAutomatica  -> Universidade e Escola Técnica
 *   - AprovacaoPeloGestor  -> Empresa Corporativa (recurso approvalRequired)
 *
 * O ReservaService não tem nenhum "if (cliente == empresa)": ele só chama
 * regras.aprovacao().statusInicial() e a estratégia escolhida responde.
 */
public interface RegraAprovacao {

    /** Status com que a reserva nasce. */
    StatusReserva statusInicial();

    boolean exigeAprovacao();

    String descricao();
}
