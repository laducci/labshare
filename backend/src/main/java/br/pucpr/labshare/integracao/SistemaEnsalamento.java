/*
 * ============================================================
 *  SistemaEnsalamento.java  |  Camada: Integração  |  AIE: Salas (Sistema de Ensalamento)
 *  Responsável na apresentação: João  |  Atividade: Medição (Arquivo de Interface Externa)
 * ------------------------------------------------------------
 *  O que faz: lê os registros de "Salas (Sistema de Ensalamento)" (arquivo ensalamento-salas.json).
 *  Chave de busca: codigo. O LabShare apenas consulta estes dados.
 * ============================================================
 */
package br.pucpr.labshare.integracao;

import org.springframework.stereotype.Component;

// @Component: o Spring cria uma única instância e injeta onde for pedido.
@Component
public class SistemaEnsalamento extends SistemaExterno<SalaEnsalamento> {

    @Override
    protected String arquivo() {
        return "ensalamento-salas.json";
    }

    @Override
    protected Class<SalaEnsalamento> tipo() {
        return SalaEnsalamento.class;
    }

    @Override
    protected String chave(SalaEnsalamento registro) {
        return registro.codigo();
    }
}
