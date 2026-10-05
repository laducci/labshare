/*
 * ============================================================
 *  LoginRequest.java  |  Camada: DTO (dados que chegam da tela)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (login / CRUD de Usuários)
 * ------------------------------------------------------------
 *  O que faz: Corpo JSON enviado pela tela de Login: e-mail e senha digitados.
 *  Fluxo: Login.jsx -> api.post("/auth/login") -> AuthController -> AuthService,
 *  que busca o usuário pelo e-mail e confere a senha com o hash BCrypt (RNF04).
 *  Quem chama: AuthController (@RequestBody).   Chama: nada.
 * ============================================================
 */
package br.pucpr.labshare.dto;

/** Corpo do POST /api/auth/login */
// record: classe imutável só de dados; o Java gera construtor e os acessores email() e senha().
// A senha chega em texto puro só nesta requisição e nunca é gravada assim no banco.
public record LoginRequest(String email, String senha) {
}
