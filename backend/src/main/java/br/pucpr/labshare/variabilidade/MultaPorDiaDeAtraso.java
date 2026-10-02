package br.pucpr.labshare.variabilidade;

import br.pucpr.labshare.config.ConfiguracaoEmprestimo;

import java.math.BigDecimal;

/**
 * Strategy concreta: valor diário x dias de atraso.
 * O valor diário vem do Singleton ConfiguracaoEmprestimo (padrões trabalhando juntos).
 */
public class MultaPorDiaDeAtraso implements CalculoMulta {

    @Override
    public BigDecimal calcular(long diasDeAtraso) {
        if (diasDeAtraso <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal valorDiario = ConfiguracaoEmprestimo.getInstance().getValorMultaDiaria();
        return valorDiario.multiply(BigDecimal.valueOf(diasDeAtraso));
    }

    @Override
    public String descricao() {
        return "Multa de R$ " + ConfiguracaoEmprestimo.getInstance().getValorMultaDiaria() + " por dia de atraso.";
    }
}
