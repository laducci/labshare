/*
 * ============================================================
 *  BemPatrimonial.java  |  Camada: Integração (registro de sistema externo)
 *  Responsável na apresentação: Laura  |  Atividade: Medição (AIE: Bens patrimoniais)
 * ------------------------------------------------------------
 *  Registro somente leitura vindo de outro sistema. Cada campo é um
 *  "tipo de dado" (TD) do AIE na contagem de pontos de função.
 *  record = classe imutável do Java 17 (construtor, getters, equals prontos).
 * ============================================================
 */
package br.pucpr.labshare.integracao;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BemPatrimonial(String numero, String descricao, String marca, String modelo, String numeroSerie,
                             LocalDate dataAquisicao, BigDecimal valorAquisicao, String situacao,
                             String unidadeResponsavel) {

    /** Bem baixado (descartado/vendido) não pode ser cadastrado como equipamento ativo. */
    public boolean estaBaixado() {
        return "BAIXADO".equalsIgnoreCase(situacao);
    }
}
