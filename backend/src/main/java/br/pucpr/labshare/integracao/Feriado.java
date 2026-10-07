/*
 * ============================================================
 *  Feriado.java  |  Camada: Integração (registro de sistema externo)
 *  Responsável na apresentação: Laura  |  Atividade: Medição (AIE: Feriados e recessos)
 * ------------------------------------------------------------
 *  Registro somente leitura vindo de outro sistema. Cada campo é um
 *  "tipo de dado" (TD) do AIE na contagem de pontos de função.
 *  record = classe imutável do Java 17 (construtor, getters, equals prontos).
 * ============================================================
 */
package br.pucpr.labshare.integracao;

import java.time.LocalDate;

public record Feriado(LocalDate data, String descricao, String tipo) {

    /** Chave de busca no formato AAAA-MM-DD. */
    public String dataTexto() {
        return data.toString();
    }
}
