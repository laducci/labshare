/*
 * ============================================================
 *  AprovacaoAutomatica.java  |  Camada: Variabilidade (Strategy concreta)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Strategy RegraAprovacao), Q2 (variabilidade)
 * ------------------------------------------------------------
 *  O que faz: estratégia de aprovação usada por clientes SEM o recurso
 *  "approvalRequired" (Universidade e Escola Técnica). A reserva já nasce
 *  AGENDADA, sem passar pelo gestor.
 *  Quem chama: SeletorDeRegras (cria) e ReservaService (usa).   Chama: nada.
 * ============================================================
 */
package br.pucpr.labshare.variabilidade;

import br.pucpr.labshare.model.StatusReserva;

/** Strategy concreta: a reserva já nasce "Agendada" (fluxo padrão). */
public class AprovacaoAutomatica implements RegraAprovacao {

    // Status com que a reserva é gravada: AGENDADA (confirmada direto, sem aprovação).
    @Override
    public StatusReserva statusInicial() {
        return StatusReserva.AGENDADA;
    }

    // Informa à tela (via ReservaService.regrasDoCliente) que não há etapa de aprovação.
    @Override
    public boolean exigeAprovacao() {
        return false;
    }

    // Texto mostrado ao usuário explicando a regra deste cliente.
    @Override
    public String descricao() {
        return "Reserva confirmada automaticamente.";
    }
}
