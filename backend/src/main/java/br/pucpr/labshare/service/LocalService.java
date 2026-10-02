package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.LocalDao;
import br.pucpr.labshare.model.Local;
import org.springframework.stereotype.Service;

@Service
public class LocalService extends CrudService<Local> {

    public LocalService(LocalDao dao, HistoricoService historico, TenantService tenants) {
        super(dao, historico, tenants);
    }

    @Override
    protected String nomeEntidade() {
        return "local";
    }

    @Override
    protected void validar(Local l, Contexto ctx) {
        obrigatorio(l.getNome(), "Nome");
    }
}
