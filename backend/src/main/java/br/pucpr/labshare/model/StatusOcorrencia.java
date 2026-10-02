package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Estados de uma ocorrência (defeito encontrado na inspeção). */
public enum StatusOcorrencia implements Rotulavel {

    ABERTA("Aguardando manutenção"),
    EM_MANUTENCAO("Em manutenção"),
    ENCERRADA("Concluída");

    private final String rotulo;

    StatusOcorrencia(String rotulo) {
        this.rotulo = rotulo;
    }

    @JsonValue
    @Override
    public String getRotulo() {
        return rotulo;
    }

    @JsonCreator
    public static StatusOcorrencia de(String texto) {
        return Rotulavel.converter(StatusOcorrencia.class, texto);
    }
}
