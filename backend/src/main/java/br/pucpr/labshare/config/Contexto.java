/*
 * ============================================================
 *  Contexto.java  |  Camada: Config (dados da requisição)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (multi-cliente / variabilidade), Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: carrega "quem está pedindo": o cliente (tenantId) e o usuário logado
 *  (usuarioId). Todo Service/DAO recebe o tenantId daqui para filtrar o SQL por
 *  "tenant_id = ?" e nunca misturar dados de clientes diferentes.
 *  Quem chama: é criado pelo ContextoResolver e recebido como parâmetro "Contexto ctx"
 *              em quase todos os Controllers e Services.
 *  Chama: ninguém (é só um portador de dados).
 * ============================================================
 */
package br.pucpr.labshare.config;

/**
 * Quem está fazendo a requisição: de qual cliente (tenant) e qual usuário.
 * O frontend envia isso nos cabeçalhos X-Tenant-Id e X-Usuario-Id depois do login.
 * (Em produção isso viria de um token JWT; para o trabalho, cabeçalhos deixam o fluxo visível.)
 *
 * "record" (Java 16+): classe imutável compacta. O Java gera sozinho o construtor,
 * os métodos de leitura tenantId() e usuarioId(), equals, hashCode e toString.
 */
public record Contexto(String tenantId, Long usuarioId) {
}
