package br.pucpr.labshare.variabilidade;

import java.math.BigDecimal;

/** Strategy concreta: atraso não gera cobrança. */
public class SemMulta implements CalculoMulta {

    @Override
    public BigDecimal calcular(long diasDeAtraso) {
        return BigDecimal.ZERO;
    }

    @Override
    public String descricao() {
        return "Este cliente não cobra multa por atraso.";
    }
}
