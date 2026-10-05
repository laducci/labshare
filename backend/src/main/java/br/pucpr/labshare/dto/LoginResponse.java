/*
 * ============================================================
 *  LoginResponse.java  |  Camada: DTO (dados que voltam para a tela)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (login), variabilidade (features do tenant)
 * ------------------------------------------------------------
 *  O que faz: Resposta do login: o usuário autenticado e o cliente (tenant) dele, incluindo
 *  o mapa de recursos ligados (features). O frontend guarda isso no AppContext e
 *  usa o hasFeature() para mostrar/esconder telas (variabilidade).
 *  Quem chama: AuthService (monta) e AuthController (devolve).   Chama: Usuario, Tenant.
 * ============================================================
 */
package br.pucpr.labshare.dto;

import br.pucpr.labshare.model.Tenant;
import br.pucpr.labshare.model.Usuario;

/** Resposta do login: o usuário e o cliente dele (com os recursos ligados). */
// record: o Jackson transforma em { "usuario": {...}, "tenant": {...} }.
// A senha/hash do Usuario não aparecem no JSON por causa das anotações @JsonProperty/@JsonIgnore.
public record LoginResponse(Usuario usuario, Tenant tenant) {
}
