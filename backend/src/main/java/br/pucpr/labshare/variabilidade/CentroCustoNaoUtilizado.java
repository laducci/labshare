package br.pucpr.labshare.variabilidade;

import br.pucpr.labshare.model.Reserva;

/** Strategy concreta: o cliente não usa centro de custo, então o campo é ignorado. */
public class CentroCustoNaoUtilizado implements RegraCentroCusto {

    @Override
    public void aplicar(Reserva reserva) {
        reserva.setCentroCustoId(null);
    }
}
