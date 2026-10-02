package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.CentroCustoDao;
import br.pucpr.labshare.model.CentroCusto;
import br.pucpr.labshare.model.Tenant;
import org.springframework.stereotype.Service;

/** VARIABILIDADE: módulo exclusivo de clientes com o recurso "costCenter". */
@Service
public class CentroCustoService extends CrudService<CentroCusto> {

    public CentroCustoService(CentroCustoDao dao, HistoricoService historico, TenantService tenants) {
        super(dao, historico, tenants);
    }

    @Override
    protected String nomeEntidade() {
        return "centro_custo";
    }

    @Override
    protected String recursoNecessario() {
        return Tenant.CENTRO_CUSTO;
    }

    @Override
    protected void validar(CentroCusto c, Contexto ctx) {
        obrigatorio(c.getNome(), "Nome");
    }
}
