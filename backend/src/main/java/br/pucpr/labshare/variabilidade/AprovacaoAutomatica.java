package br.pucpr.labshare.variabilidade;

import br.pucpr.labshare.model.StatusReserva;

/** Strategy concreta: a reserva já nasce "Agendada" (fluxo padrão). */
public class AprovacaoAutomatica implements RegraAprovacao {

    @Override
    public StatusReserva statusInicial() {
        return StatusReserva.AGENDADA;
    }

    @Override
    public boolean exigeAprovacao() {
        return false;
    }

    @Override
    public String descricao() {
        return "Reserva confirmada automaticamente.";
    }
}
