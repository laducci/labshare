/*
 * ============================================================
 *  DecisaoRequest.java  |  Camada: DTO (dados que chegam da tela)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (variabilidade approvalRequired), Q1 (Strategy RegraAprovacao)
 * ------------------------------------------------------------
 *  O que faz: Corpo opcional enviado pelo gestor ao aprovar/rejeitar uma reserva na tela
 *  ApprovalDetail. Só é usado por clientes com o recurso "approvalRequired".
 *  Ex.: POST /api/reservas/{id}/rejeitar  { "motivo": "Equipamento reservado para aula" }.
 *  Quem chama: ReservaController (rejeitar/aprovar).   Chama: nada.
 * ============================================================
 */
package br.pucpr.labshare.dto;

/** Corpo opcional de aprovar/rejeitar reserva. */
// record (Java 16+): classe imutável só de dados. O Java gera sozinho construtor, o acessor
// motivo(), equals/hashCode/toString. O Jackson converte o JSON do corpo direto para ele.
public record DecisaoRequest(String motivo) {
}
