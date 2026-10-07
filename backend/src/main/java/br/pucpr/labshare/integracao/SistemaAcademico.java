/*
 * ============================================================
 *  SistemaAcademico.java  |  Camada: Integração  |  AIE: Pessoas com vínculo (Sistema Acadêmico/RH)
 *  Responsável na apresentação: Camilla  |  Atividade: Medição (Arquivo de Interface Externa)
 * ------------------------------------------------------------
 *  O que faz: lê os registros de "Pessoas com vínculo (Sistema Acadêmico/RH)" (arquivo academico-pessoas.json).
 *  Chave de busca: matricula. O LabShare apenas consulta estes dados.
 * ============================================================
 */
package br.pucpr.labshare.integracao;

import org.springframework.stereotype.Component;

// @Component: o Spring cria uma única instância e injeta onde for pedido.
@Component
public class SistemaAcademico extends SistemaExterno<PessoaInstitucional> {

    @Override
    protected String arquivo() {
        return "academico-pessoas.json";
    }

    @Override
    protected Class<PessoaInstitucional> tipo() {
        return PessoaInstitucional.class;
    }

    @Override
    protected String chave(PessoaInstitucional registro) {
        return registro.matricula();
    }
}
