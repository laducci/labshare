/*
 * ============================================================
 *  LocalService.java  |  Camada: Service (regras de negócio)
 *  Responsável na apresentação: João  |  Atividade: Q2 (CRUD de Locais), Q3 (reuso via CrudService)
 * ------------------------------------------------------------
 *  O que faz: regras do CRUD de locais (laboratórios/salas onde ficam os
 *  equipamentos). Todo o CRUD vem do CrudService; aqui só há o nome da
 *  entidade e a validação do nome obrigatório.
 *  Quem chama: LocalController (/api/locais, tela genérica CrudPage).
 *  Chama: LocalDao (via CrudService), HistoricoService.
 * ============================================================
 */
package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.LocalDao;
import br.pucpr.labshare.model.Local;
import org.springframework.stereotype.Service;

// @Service: o Spring cria uma única instância desta classe e a injeta no LocalController.
@Service
public class LocalService extends CrudService<Local> {

    // Injeção pelo construtor; tudo é repassado para o CrudService (super).
    public LocalService(LocalDao dao, HistoricoService historico, TenantService tenants) {
        super(dao, historico, tenants);
    }

    // Nome usado no histórico e nas mensagens de erro.
    @Override
    protected String nomeEntidade() {
        return "local";
    }

    // Gancho de validação: roda antes do INSERT/UPDATE (POST e PUT de /api/locais).
    @Override
    protected void validar(Local l, Contexto ctx) {
        obrigatorio(l.getNome(), "Nome");
    }
}
