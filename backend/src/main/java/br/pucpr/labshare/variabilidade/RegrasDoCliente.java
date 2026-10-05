/*
 * ============================================================
 *  RegrasDoCliente.java  |  Camada: Variabilidade (agrupador das estratégias)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Strategy), Q2 (variabilidade)
 * ------------------------------------------------------------
 *  O que faz: "pacote" com as três estratégias de um cliente (aprovação,
 *  multa e centro de custo). É devolvido pelo SeletorDeRegras.para(tenantId).
 *  Quem chama: SeletorDeRegras (cria); ReservaService, MultaService e
 *              ProcessoDevolucao (leem as estratégias).   Chama: nada.
 * ============================================================
 */
package br.pucpr.labshare.variabilidade;

// "record" (Java 16+): classe imutável só de dados; o Java gera sozinho o construtor
// e os métodos de acesso aprovacao(), multa() e centroCusto().
/** As três estratégias escolhidas para um cliente, agrupadas. */
public record RegrasDoCliente(RegraAprovacao aprovacao, CalculoMulta multa, RegraCentroCusto centroCusto) {
}
