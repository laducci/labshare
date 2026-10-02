package br.pucpr.labshare.variabilidade;

import br.pucpr.labshare.model.StatusReserva;

/** Strategy concreta: a reserva nasce "Aguardando aprovação" e o gestor decide. */
public class AprovacaoPeloGestor implements RegraAprovacao {

    @Override
    public StatusReserva statusInicial() {
        return StatusReserva.AGUARDANDO_APROVACAO;
    }

    @Override
    public boolean exigeAprovacao() {
        return true;
    }

    @Override
    public String descricao() {
        return "Reserva enviada para aprovação do gestor do centro de custo.";
    }
}
