package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Estados possíveis de um equipamento (ciclo de vida do handoff, seção 15). */
public enum StatusEquipamento implements Rotulavel {

    DISPONIVEL("Disponível"),
    RESERVADO("Reservado"),
    EM_USO("Em uso"),
    EM_INSPECAO("Em inspeção"),
    EM_MANUTENCAO("Em manutenção"),
    INDISPONIVEL("Indisponível");

    private final String rotulo;

    StatusEquipamento(String rotulo) {
        this.rotulo = rotulo;
    }

    @JsonValue
    @Override
    public String getRotulo() {
        return rotulo;
    }

    @JsonCreator
    public static StatusEquipamento de(String texto) {
        return Rotulavel.converter(StatusEquipamento.class, texto);
    }
}
