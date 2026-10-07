/*
 * ============================================================
 *  FornecedorAssistencia.java  |  Camada: Integração (registro de sistema externo)
 *  Responsável na apresentação: Camilla  |  Atividade: Medição (AIE: Fornecedores de assistência técnica)
 * ------------------------------------------------------------
 *  Registro somente leitura vindo de outro sistema. Cada campo é um
 *  "tipo de dado" (TD) do AIE na contagem de pontos de função.
 *  record = classe imutável do Java 17 (construtor, getters, equals prontos).
 * ============================================================
 */
package br.pucpr.labshare.integracao;

public record FornecedorAssistencia(String cnpj, String razaoSocial, String nomeFantasia, String especialidade,
                                    String telefone, String email, boolean contratoVigente) {
}
