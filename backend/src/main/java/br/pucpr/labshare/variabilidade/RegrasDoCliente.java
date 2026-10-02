package br.pucpr.labshare.variabilidade;

/** As três estratégias escolhidas para um cliente, agrupadas. */
public record RegrasDoCliente(RegraAprovacao aprovacao, CalculoMulta multa, RegraCentroCusto centroCusto) {
}
