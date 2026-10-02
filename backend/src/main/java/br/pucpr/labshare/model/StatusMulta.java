package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Estados de uma multa por atraso (recurso lateFee). */
public enum StatusMulta implements Rotulavel {

    EM_ABERTO("Em aberto"),
    PAGA("Paga");

    private final String rotulo;

    StatusMulta(String rotulo) {
        this.rotulo = rotulo;
    }

    @JsonValue
    @Override
    public String getRotulo() {
        return rotulo;
    }

    @JsonCreator
    public static StatusMulta de(String texto) {
        return Rotulavel.converter(StatusMulta.class, texto);
    }
}
