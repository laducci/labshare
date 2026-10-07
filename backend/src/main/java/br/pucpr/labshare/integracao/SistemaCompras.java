/*
 * ============================================================
 *  SistemaCompras.java  |  Camada: Integração  |  AIE: Fornecedores de assistência técnica (Sistema de Compras)
 *  Responsável na apresentação: Camilla  |  Atividade: Medição (Arquivo de Interface Externa)
 * ------------------------------------------------------------
 *  O que faz: lê os registros de "Fornecedores de assistência técnica (Sistema de Compras)" (arquivo compras-fornecedores.json).
 *  Chave de busca: cnpj. O LabShare apenas consulta estes dados.
 * ============================================================
 */
package br.pucpr.labshare.integracao;

import org.springframework.stereotype.Component;

// @Component: o Spring cria uma única instância e injeta onde for pedido.
@Component
public class SistemaCompras extends SistemaExterno<FornecedorAssistencia> {

    @Override
    protected String arquivo() {
        return "compras-fornecedores.json";
    }

    @Override
    protected Class<FornecedorAssistencia> tipo() {
        return FornecedorAssistencia.class;
    }

    @Override
    protected String chave(FornecedorAssistencia registro) {
        return registro.cnpj();
    }
}
