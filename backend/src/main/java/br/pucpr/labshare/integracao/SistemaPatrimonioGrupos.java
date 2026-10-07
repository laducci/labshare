/*
 * ============================================================
 *  SistemaPatrimonioGrupos.java  |  Camada: Integração  |  AIE: Grupos patrimoniais (Sistema de Patrimônio)
 *  Responsável na apresentação: João  |  Atividade: Medição (Arquivo de Interface Externa)
 * ------------------------------------------------------------
 *  O que faz: lê os registros de "Grupos patrimoniais (Sistema de Patrimônio)" (arquivo patrimonio-grupos.json).
 *  Chave de busca: codigo. O LabShare apenas consulta estes dados.
 * ============================================================
 */
package br.pucpr.labshare.integracao;

import org.springframework.stereotype.Component;

// @Component: o Spring cria uma única instância e injeta onde for pedido.
@Component
public class SistemaPatrimonioGrupos extends SistemaExterno<GrupoPatrimonial> {

    @Override
    protected String arquivo() {
        return "patrimonio-grupos.json";
    }

    @Override
    protected Class<GrupoPatrimonial> tipo() {
        return GrupoPatrimonial.class;
    }

    @Override
    protected String chave(GrupoPatrimonial registro) {
        return registro.codigo();
    }
}
