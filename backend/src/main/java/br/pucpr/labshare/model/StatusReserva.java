package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Estados de uma reserva. AGUARDANDO_APROVACAO só existe para clientes com o recurso approvalRequired. */
public enum StatusReserva implements Rotulavel {

    AGUARDANDO_APROVACAO("Aguardando aprovação"),
    AGENDADA("Agendada"),
    EM_USO("Em uso"),
    FINALIZADA("Finalizada"),
    CANCELADA("Cancelada"),
    REJEITADA("Rejeitada");

    private final String rotulo;

    StatusReserva(String rotulo) {
        this.rotulo = rotulo;
    }

    @JsonValue
    @Override
    public String getRotulo() {
        return rotulo;
    }

    @JsonCreator
    public static StatusReserva de(String texto) {
        return Rotulavel.converter(StatusReserva.class, texto);
    }
}
