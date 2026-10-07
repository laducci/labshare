/*
 * ============================================================
 *  SistemaPatrimonioBens.java  |  Camada: Integração  |  AIE: Bens patrimoniais (Sistema de Patrimônio)
 *  Responsável na apresentação: Laura  |  Atividade: Medição (Arquivo de Interface Externa)
 * ------------------------------------------------------------
 *  O que faz: lê os registros de "Bens patrimoniais (Sistema de Patrimônio)" (arquivo patrimonio-bens.json).
 *  Chave de busca: numero. O LabShare apenas consulta estes dados.
 * ============================================================
 */
package br.pucpr.labshare.integracao;

import org.springframework.stereotype.Component;

// @Component: o Spring cria uma única instância e injeta onde for pedido.
@Component
public class SistemaPatrimonioBens extends SistemaExterno<BemPatrimonial> {

    @Override
    protected String arquivo() {
        return "patrimonio-bens.json";
    }

    @Override
    protected Class<BemPatrimonial> tipo() {
        return BemPatrimonial.class;
    }

    @Override
    protected String chave(BemPatrimonial registro) {
        return registro.numero();
    }
}
