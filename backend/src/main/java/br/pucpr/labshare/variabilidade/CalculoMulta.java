package br.pucpr.labshare.variabilidade;

import java.math.BigDecimal;

/**
 * ============================================================
 *  PADRÃO DE PROJETO: STRATEGY  (exemplo 2 de 3) - interface
 * ============================================================
 * Pergunta que varia: "Devolver atrasado gera multa? De quanto?"
 *   - SemMulta             -> Universidade e Empresa
 *   - MultaPorDiaDeAtraso  -> Escola Técnica (recurso lateFee)
 *
 * Um novo cliente que quisesse "multa fixa de R$ 20" ganharia só uma classe nova
 * (ex.: MultaFixa implements CalculoMulta), sem mexer no ProcessoDevolucao.
 */
public interface CalculoMulta {

    BigDecimal calcular(long diasDeAtraso);

    String descricao();
}
