package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Estados de uma manutenção. */
public enum StatusManutencao implements Rotulavel {

    EM_ANDAMENTO("Em manutenção"),
    AGUARDANDO_PECA("Aguardando peça"),
    CONCLUIDA("Concluída");

    private final String rotulo;

    StatusManutencao(String rotulo) {
        this.rotulo = rotulo;
    }

    @JsonValue
    @Override
    public String getRotulo() {
        return rotulo;
    }

    @JsonCreator
    public static StatusManutencao de(String texto) {
        return Rotulavel.converter(StatusManutencao.class, texto);
    }
}
