/*
 * ============================================================
 *  CalculoMulta.java  |  Camada: Variabilidade (interface Strategy)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Strategy CalculoMulta), Q2 (variabilidade)
 * ------------------------------------------------------------
 *  O que faz: define o "contrato" que toda regra de multa precisa cumprir:
 *  dado o número de dias de atraso, devolve o valor a cobrar. Quem usa a
 *  interface não sabe (nem precisa saber) qual cálculo está por trás.
 *  Quem chama: ProcessoDevolucao (gancho depoisDeConcluir), MultaService,
 *              ReservaService.regrasDoCliente.
 *  Implementações: SemMulta, MultaPorDiaDeAtraso (escolhidas no SeletorDeRegras).
 * ============================================================
 */
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

    // Calcula o valor da multa. BigDecimal é usado para dinheiro (evita erro de arredondamento do double).
    BigDecimal calcular(long diasDeAtraso);

    // Texto explicando a regra (aparece na tela "Confirmar reserva").
    String descricao();
}
