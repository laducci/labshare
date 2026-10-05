/*
 * ============================================================
 *  StatusReserva.java  |  Camada: Model (enum de status)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Reservas), Q2 variabilidade (approvalRequired)
 * ------------------------------------------------------------
 *  O que faz: Estados de uma reserva: Aguardando aprovação -> Agendada -> Em uso -> Finalizada
 *  (ou Cancelada/Rejeitada). AGUARDANDO_APROVACAO só aparece para clientes com o
 *  recurso approvalRequired (estratégia AprovacaoPeloGestor).
 *  Quem chama: Reserva, ReservaDao, ReservaService, estratégias RegraAprovacao.   Chama: Rotulavel.
 * ============================================================
 */
package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Estados de uma reserva. AGUARDANDO_APROVACAO só existe para clientes com o recurso approvalRequired. */
// "implements Rotulavel": reaproveita a conversão texto <-> enum (reuso).
public enum StatusReserva implements Rotulavel {

    AGUARDANDO_APROVACAO("Aguardando aprovação"),
    AGENDADA("Agendada"),
    EM_USO("Em uso"),
    FINALIZADA("Finalizada"),
    CANCELADA("Cancelada"),
    REJEITADA("Rejeitada");

    // Construtor do enum: guarda o rótulo de cada constante (Java chama uma vez para cada valor acima).
    private final String rotulo;

    StatusReserva(String rotulo) {
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
    public static StatusReserva de(String texto) {
        return Rotulavel.converter(StatusReserva.class, texto);
    }
}
