/*
 * ============================================================
 *  StatusManutencao.java  |  Camada: Model (enum de status)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (CRUD de Manutenções), RN10
 * ------------------------------------------------------------
 *  O que faz: Estados de uma manutenção: em andamento, aguardando peça ou concluída.
 *  Só depois de CONCLUIDA o equipamento pode voltar a "Disponível" (RN10).
 *  Quem chama: Manutencao, ManutencaoDao, ManutencaoService.   Chama: Rotulavel.
 * ============================================================
 */
package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Estados de uma manutenção. */
// "implements Rotulavel": reaproveita a conversão texto <-> enum (reuso).
public enum StatusManutencao implements Rotulavel {

    EM_ANDAMENTO("Em manutenção"),
    AGUARDANDO_PECA("Aguardando peça"),
    CONCLUIDA("Concluída");

    // Construtor do enum: guarda o rótulo de cada constante (Java chama uma vez para cada valor acima).
    private final String rotulo;

    StatusManutencao(String rotulo) {
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
    public static StatusManutencao de(String texto) {
        return Rotulavel.converter(StatusManutencao.class, texto);
    }
}
