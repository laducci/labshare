/*
 * ============================================================
 *  StatusMulta.java  |  Camada: Model (enum de status)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (variabilidade lateFee)
 * ------------------------------------------------------------
 *  O que faz: Estados de uma multa por atraso: em aberto ou paga. Só existe para clientes
 *  com o recurso "lateFee" (Escola Técnica).
 *  Quem chama: Multa, MultaDao, MultaService.   Chama: Rotulavel.
 * ============================================================
 */
package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Estados de uma multa por atraso (recurso lateFee). */
// "implements Rotulavel": reaproveita a conversão texto <-> enum (reuso).
public enum StatusMulta implements Rotulavel {

    EM_ABERTO("Em aberto"),
    PAGA("Paga");

    // Construtor do enum: guarda o rótulo de cada constante (Java chama uma vez para cada valor acima).
    private final String rotulo;

    StatusMulta(String rotulo) {
        this.rotulo = rotulo;
    }

    // @JsonValue: ao virar JSON, o enum é enviado como o rótulo amigável (ex.: "Em uso"), não como EM_USO.
    @JsonValue
    @Override
    public String getRotulo() {
        return rotulo;
    }

    // @JsonCreator: ao ler JSON, o Jackson usa este método para aceitar tanto o rótulo quanto o nome (reuso do Rotulavel.converter).
    @JsonCreator
    public static StatusMulta de(String texto) {
        return Rotulavel.converter(StatusMulta.class, texto);
    }
}
