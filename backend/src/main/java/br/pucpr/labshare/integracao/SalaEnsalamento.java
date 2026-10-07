/*
 * ============================================================
 *  SalaEnsalamento.java  |  Camada: Integração (registro de sistema externo)
 *  Responsável na apresentação: João  |  Atividade: Medição (AIE: Salas do ensalamento)
 * ------------------------------------------------------------
 *  Registro somente leitura vindo de outro sistema. Cada campo é um
 *  "tipo de dado" (TD) do AIE na contagem de pontos de função.
 *  record = classe imutável do Java 17 (construtor, getters, equals prontos).
 * ============================================================
 */
package br.pucpr.labshare.integracao;

public record SalaEnsalamento(String codigo, String nome, String bloco, String andar, Integer capacidade, String tipo) {
}
