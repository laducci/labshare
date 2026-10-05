/*
 * ============================================================
 *  CategoriaController.java  |  Camada: Controller (API REST)
 *  Responsável na apresentação: João  |  Atividade: Q2 (CRUD de Categorias), Q3 (reuso via CrudController)
 * ------------------------------------------------------------
 *  O que faz: expõe o CRUD de categorias em /api/categorias. Não tem nenhum método próprio:
 *  as 5 rotas (GET, GET/{id}, POST, PUT/{id}, DELETE/{id}) são herdadas do CrudController.
 *  Quem chama: tela genérica CrudPage.jsx (config "categorias" em crudConfigs.jsx), Home e
 *  EquipmentForm/EquipmentList (para preencher o select de categorias).
 *  Chama: CategoriaService -> CategoriaDao -> tabela categoria.
 * ============================================================
 */
package br.pucpr.labshare.controller;

import br.pucpr.labshare.model.Categoria;
import br.pucpr.labshare.service.CategoriaService;
import br.pucpr.labshare.service.CrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** CRUD completo de categorias em /api/categorias — todas as rotas vêm do CrudController. */
// @RestController: classe que responde HTTP com JSON. @RequestMapping: prefixo /api/categorias,
// que o Spring soma aos caminhos herdados (ex.: @GetMapping("/{id}") vira GET /api/categorias/{id}).
@RestController
@RequestMapping("/api/categorias")
public class CategoriaController extends CrudController<Categoria> {

    private final CategoriaService service;

    // Injeção pelo construtor: o Spring entrega o CategoriaService (anotado com @Service).
    public CategoriaController(CategoriaService service) {
        this.service = service;
    }

    // Único método obrigatório: diz ao CrudController qual Service atende esta entidade.
    @Override
    protected CrudService<Categoria> service() {
        return service;
    }
}
