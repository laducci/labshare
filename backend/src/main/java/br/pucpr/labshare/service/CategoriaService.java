package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.CategoriaDao;
import br.pucpr.labshare.model.Categoria;
import org.springframework.stereotype.Service;

@Service
public class CategoriaService extends CrudService<Categoria> {

    public CategoriaService(CategoriaDao dao, HistoricoService historico, TenantService tenants) {
        super(dao, historico, tenants);
    }

    @Override
    protected String nomeEntidade() {
        return "categoria";
    }

    @Override
    protected void validar(Categoria c, Contexto ctx) {
        obrigatorio(c.getNome(), "Nome");
        if (c.getIcone() == null || c.getIcone().isBlank()) {
            c.setIcone("cpu");
        }
    }
}
