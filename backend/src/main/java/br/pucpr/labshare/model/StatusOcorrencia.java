/*
 * ============================================================
 *  StatusOcorrencia.java  |  Camada: Model (enum de status)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (ocorrências), RN08/RN09
 * ------------------------------------------------------------
 *  O que faz: Estados de uma ocorrência: aguardando manutenção (ABERTA), em manutenção e
 *  concluída (ENCERRADA). O rótulo é o texto exibido na tela.
 *  Quem chama: Ocorrencia, OcorrenciaDao, OcorrenciaService, ManutencaoService.   Chama: Rotulavel.
 * ============================================================
 */
package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Estados de uma ocorrência (defeito encontrado na inspeção). */
// "implements Rotulavel": reaproveita a conversão texto <-> enum (reuso).
public enum StatusOcorrencia implements Rotulavel {

    ABERTA("Aguardando manutenção"),
    EM_MANUTENCAO("Em manutenção"),
    ENCERRADA("Concluída");

    // Construtor do enum: guarda o rótulo de cada constante (Java chama uma vez para cada valor acima).
    private final String rotulo;

    StatusOcorrencia(String rotulo) {
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
    public static StatusOcorrencia de(String texto) {
        return Rotulavel.converter(StatusOcorrencia.class, texto);
    }
}
