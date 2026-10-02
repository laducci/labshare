package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Perfis de acesso (RF22 / RNF05). O código em minúsculo é o mesmo usado no frontend. */
public enum Perfil implements Rotulavel {

    ALUNO("aluno"),
    PROFESSOR("professor"),
    TECNICO("tecnico"),
    MANUTENCAO("manutencao"),
    GESTOR("gestor"),
    ADMIN("admin");

    private final String codigo;

    Perfil(String codigo) {
        this.codigo = codigo;
    }

    @JsonValue
    @Override
    public String getRotulo() {
        return codigo;
    }

    /** Quem pode cadastrar/editar equipamentos. */
    public boolean podeGerenciarEquipamentos() {
        return this == ADMIN || this == TECNICO;
    }

    /** Quem faz reservas para si mesmo. */
    public boolean ehSolicitante() {
        return this == ALUNO || this == PROFESSOR;
    }

    @JsonCreator
    public static Perfil de(String texto) {
        return Rotulavel.converter(Perfil.class, texto);
    }
}
