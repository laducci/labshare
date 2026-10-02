package br.pucpr.labshare.controller;

import br.pucpr.labshare.model.Categoria;
import br.pucpr.labshare.service.CategoriaService;
import br.pucpr.labshare.service.CrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** CRUD completo de categorias em /api/categorias — todas as rotas vêm do CrudController. */
@RestController
@RequestMapping("/api/categorias")
public class CategoriaController extends CrudController<Categoria> {

    private final CategoriaService service;

    public CategoriaController(CategoriaService service) {
        this.service = service;
    }

    @Override
    protected CrudService<Categoria> service() {
        return service;
    }
}
