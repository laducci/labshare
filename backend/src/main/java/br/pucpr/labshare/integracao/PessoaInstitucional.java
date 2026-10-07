/*
 * ============================================================
 *  PessoaInstitucional.java  |  Camada: Integração (registro de sistema externo)
 *  Responsável na apresentação: Camilla  |  Atividade: Medição (AIE: Pessoas do sistema acadêmico/RH)
 * ------------------------------------------------------------
 *  Registro somente leitura vindo de outro sistema. Cada campo é um
 *  "tipo de dado" (TD) do AIE na contagem de pontos de função.
 *  record = classe imutável do Java 17 (construtor, getters, equals prontos).
 * ============================================================
 */
package br.pucpr.labshare.integracao;

public record PessoaInstitucional(String matricula, String nome, String email, String vinculo, String curso, String situacao) {

    /** Só pessoas com vínculo ativo podem ganhar acesso ao LabShare. */
    public boolean estaAtiva() {
        return "ATIVO".equalsIgnoreCase(situacao);
    }
}
