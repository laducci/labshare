package br.pucpr.labshare.config;

/**
 * Quem está fazendo a requisição: de qual cliente (tenant) e qual usuário.
 * O frontend envia isso nos cabeçalhos X-Tenant-Id e X-Usuario-Id depois do login.
 * (Em produção isso viria de um token JWT; para o trabalho, cabeçalhos deixam o fluxo visível.)
 */
public record Contexto(String tenantId, Long usuarioId) {
}
