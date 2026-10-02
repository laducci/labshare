package br.pucpr.labshare.controller;

import br.pucpr.labshare.model.Local;
import br.pucpr.labshare.service.LocalService;
import br.pucpr.labshare.service.CrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** CRUD completo de locais em /api/locais — todas as rotas vêm do CrudController. */
@RestController
@RequestMapping("/api/locais")
public class LocalController extends CrudController<Local> {

    private final LocalService service;

    public LocalController(LocalService service) {
        this.service = service;
    }

    @Override
    protected CrudService<Local> service() {
        return service;
    }
}
