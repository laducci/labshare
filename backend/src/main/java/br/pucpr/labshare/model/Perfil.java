/*
 * ============================================================
 *  Perfil.java  |  Camada: Model (enum de perfis de acesso)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (CRUD de Usuários / login), RNF05
 * ------------------------------------------------------------
 *  O que faz: Enum com os perfis de acesso (aluno, professor, técnico, manutenção, gestor,
 *  admin). O código em minúsculo é o mesmo usado pelo frontend no
 *  App.jsx/ProtectedRoute/Sidebar para decidir quais telas cada perfil vê (RNF05).
 *  Quem chama: Usuario, UsuarioDao, services que checam permissão.   Chama: Rotulavel.
 * ============================================================
 */
package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Perfis de acesso (RF22 / RNF05). O código em minúsculo é o mesmo usado no frontend. */
// "implements Rotulavel": reaproveita a conversão texto <-> enum comum a todos os enums.
public enum Perfil implements Rotulavel {

    ALUNO("aluno"),
    PROFESSOR("professor"),
    TECNICO("tecnico"),
    MANUTENCAO("manutencao"),
    GESTOR("gestor"),
    ADMIN("admin");

    // Construtor do enum: guarda o código em minúsculo de cada perfil.
    private final String codigo;

    Perfil(String codigo) {
        this.codigo = codigo;
    }

    // @JsonValue: no JSON o perfil vai como "aluno", "admin"... (igual ao frontend).
    @JsonValue
    @Override
    public String getRotulo() {
        return codigo;
    }

    /** Quem pode cadastrar/editar equipamentos. */
    // Métodos de permissão: concentram a regra de perfil num lugar só (RNF05).
    public boolean podeGerenciarEquipamentos() {
        return this == ADMIN || this == TECNICO;
    }

    /** Quem faz reservas para si mesmo. */
    public boolean ehSolicitante() {
        return this == ALUNO || this == PROFESSOR;
    }

    // @JsonCreator: converte o texto recebido no JSON para o enum (aceita "admin" ou "ADMIN").
    @JsonCreator
    public static Perfil de(String texto) {
        return Rotulavel.converter(Perfil.class, texto);
    }
}
