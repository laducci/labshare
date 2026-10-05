/*
 * ============================================================
 *  StatusEquipamento.java  |  Camada: Model (enum de status)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Equipamentos), RN01/RN02/RN06/RN09/RN10
 * ------------------------------------------------------------
 *  O que faz: Estados possíveis de um equipamento. No banco é gravado o nome (EM_USO);
 *  no JSON/tela aparece o rótulo ("Em uso"). As transições ficam nos métodos
 *  de Equipamento (marcarComoReservado, registrarRetirada, liberar...).
 *  Quem chama: Equipamento, EquipamentoDao, EquipamentoService.   Chama: Rotulavel.
 * ============================================================
 */
package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Estados possíveis de um equipamento (ciclo de vida do handoff, seção 15). */
// "implements Rotulavel": reaproveita a conversão texto <-> enum (reuso).
public enum StatusEquipamento implements Rotulavel {

    DISPONIVEL("Disponível"),
    RESERVADO("Reservado"),
    EM_USO("Em uso"),
    EM_INSPECAO("Em inspeção"),
    EM_MANUTENCAO("Em manutenção"),
    INDISPONIVEL("Indisponível");

    // Construtor do enum: guarda o rótulo de cada constante (Java chama uma vez para cada valor acima).
    private final String rotulo;

    StatusEquipamento(String rotulo) {
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
    public static StatusEquipamento de(String texto) {
        return Rotulavel.converter(StatusEquipamento.class, texto);
    }
}
