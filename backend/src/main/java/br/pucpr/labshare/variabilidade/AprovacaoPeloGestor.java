/*
 * ============================================================
 *  AprovacaoPeloGestor.java  |  Camada: Variabilidade (Strategy concreta)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Strategy RegraAprovacao), Q2 (variabilidade)
 * ------------------------------------------------------------
 *  O que faz: estratégia de aprovação usada pelo cliente com o recurso
 *  "approvalRequired" ligado (Empresa Corporativa). A reserva nasce
 *  AGUARDANDO_APROVACAO e só vira AGENDADA quando o gestor aprova.
 *  Quem chama: SeletorDeRegras (cria) e ReservaService (usa).   Chama: nada.
 * ============================================================
 */
package br.pucpr.labshare.variabilidade;

import br.pucpr.labshare.model.StatusReserva;

/** Strategy concreta: a reserva nasce "Aguardando aprovação" e o gestor decide. */
public class AprovacaoPeloGestor implements RegraAprovacao {

    // A reserva fica pendente; o gestor aprova/rejeita depois em
    // POST /api/reservas/{id}/aprovar ou /rejeitar (tela ApprovalDetail).
    @Override
    public StatusReserva statusInicial() {
        return StatusReserva.AGUARDANDO_APROVACAO;
    }

    // Avisa a tela "Confirmar reserva" de que existe a etapa de aprovação.
    @Override
    public boolean exigeAprovacao() {
        return true;
    }

    // Texto mostrado ao usuário explicando a regra deste cliente.
    @Override
    public String descricao() {
        return "Reserva enviada para aprovação do gestor do centro de custo.";
    }
}
