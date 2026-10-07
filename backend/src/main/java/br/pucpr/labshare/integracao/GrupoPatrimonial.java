/*
 * ============================================================
 *  GrupoPatrimonial.java  |  Camada: Integração (registro de sistema externo)
 *  Responsável na apresentação: João  |  Atividade: Medição (AIE: Grupos patrimoniais)
 * ------------------------------------------------------------
 *  Registro somente leitura vindo de outro sistema. Cada campo é um
 *  "tipo de dado" (TD) do AIE na contagem de pontos de função.
 *  record = classe imutável do Java 17 (construtor, getters, equals prontos).
 * ============================================================
 */
package br.pucpr.labshare.integracao;

import java.math.BigDecimal;

public record GrupoPatrimonial(String codigo, String nome, String descricao, Integer vidaUtilAnos,
                               BigDecimal taxaDepreciacaoAnual) {
}
