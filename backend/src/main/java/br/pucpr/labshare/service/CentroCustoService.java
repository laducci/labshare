/*
 * ============================================================
 *  CentroCustoService.java  |  Camada: Service (regras de negócio)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (variabilidade: módulo costCenter), Q3 (reuso via CrudService)
 * ------------------------------------------------------------
 *  O que faz: CRUD de centros de custo. É um módulo EXCLUSIVO: só funciona para
 *  clientes com o recurso "costCenter" ligado (Empresa Corporativa); para os
 *  demais, qualquer chamada responde 403.
 *  Quem chama: CentroCustoController (/api/centros-custo, tela CrudPage).
 *  Chama: CentroCustoDao (via CrudService), TenantService.exigirRecurso.
 * ============================================================
 */
package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.CentroCustoDao;
import br.pucpr.labshare.model.CentroCusto;
import br.pucpr.labshare.model.Tenant;
import org.springframework.stereotype.Service;

/** VARIABILIDADE: módulo exclusivo de clientes com o recurso "costCenter". */
// @Service: bean do Spring, injetado no CentroCustoController.
@Service
public class CentroCustoService extends CrudService<CentroCusto> {

    // Injeção pelo construtor; repassa ao CrudService (super).
    public CentroCustoService(CentroCustoDao dao, HistoricoService historico, TenantService tenants) {
        super(dao, historico, tenants);
    }

    // Nome usado no histórico e nas mensagens.
    @Override
    protected String nomeEntidade() {
        return "centro_custo";
    }

    // Gancho de variabilidade: o CrudService chama verificarRecurso() em toda operação
    // e bloqueia (403) se o cliente não tiver "costCenter" ligado.
    @Override
    protected String recursoNecessario() {
        return Tenant.CENTRO_CUSTO;
    }

    // Validação antes de gravar: nome obrigatório.
    @Override
    protected void validar(CentroCusto c, Contexto ctx) {
        obrigatorio(c.getNome(), "Nome");
    }
}
