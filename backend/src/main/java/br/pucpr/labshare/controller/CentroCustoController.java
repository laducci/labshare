package br.pucpr.labshare.controller;

import br.pucpr.labshare.model.CentroCusto;
import br.pucpr.labshare.service.CentroCustoService;
import br.pucpr.labshare.service.CrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** CRUD completo de centros de custo (só clientes com costCenter) em /api/centros-custo — todas as rotas vêm do CrudController. */
@RestController
@RequestMapping("/api/centros-custo")
public class CentroCustoController extends CrudController<CentroCusto> {

    private final CentroCustoService service;

    public CentroCustoController(CentroCustoService service) {
        this.service = service;
    }

    @Override
    protected CrudService<CentroCusto> service() {
        return service;
    }
}
