/*
 * ============================================================
 *  RegraAprovacao.java  |  Camada: Variabilidade (interface Strategy)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Strategy RegraAprovacao), Q2 (variabilidade)
 * ------------------------------------------------------------
 *  O que faz: contrato das regras de aprovação de reserva. Cada cliente
 *  (tenant) recebe uma implementação diferente, escolhida pelo SeletorDeRegras
 *  conforme o recurso "approvalRequired" na tabela tenant_recurso.
 *  Quem chama: ReservaService (antesDeSalvar e regrasDoCliente).
 *  Implementações: AprovacaoAutomatica, AprovacaoPeloGestor.
 * ============================================================
 */
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

    // true se a reserva precisa passar pelo gestor (a tela mostra esse aviso).
    boolean exigeAprovacao();

    // Texto explicando a regra ao usuário (tela "Confirmar reserva").
    String descricao();
}
