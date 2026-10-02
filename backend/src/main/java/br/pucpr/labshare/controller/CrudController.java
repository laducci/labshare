package br.pucpr.labshare.controller;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.model.EntidadeBase;
import br.pucpr.labshare.service.CrudService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

/**
 * Controller REST genérico (REUSO / COMPACTAÇÃO DE CÓDIGO).
 *
 * Toda entidade ganha as mesmas 5 rotas só por herdar desta classe:
 *   GET    /api/{recurso}        -> listar      (Read)
 *   GET    /api/{recurso}/{id}   -> buscar      (Read)
 *   POST   /api/{recurso}        -> criar       (Create)  -> INSERT
 *   PUT    /api/{recurso}/{id}   -> atualizar   (Update)  -> UPDATE
 *   DELETE /api/{recurso}/{id}   -> excluir     (Delete)  -> UPDATE ativo = false
 *
 * Caminho de uma requisição (ex.: botão "Salvar" na tela de Categorias):
 *   React fetch POST /api/categorias  ->  CategoriaController.criar (herdado daqui)
 *   ->  CategoriaService.criar (valida)  ->  CategoriaDao.inserir  ->  INSERT INTO categoria ...
 */
public abstract class CrudController<T extends EntidadeBase> {

    /** Cada controller concreto informa qual serviço usar. */
    protected abstract CrudService<T> service();

    @GetMapping
    public List<T> listar(Contexto ctx) {
        return service().listar(ctx);
    }

    @GetMapping("/{id}")
    public T buscar(@PathVariable Long id, Contexto ctx) {
        return service().buscar(id, ctx);
    }

    @PostMapping
    public ResponseEntity<T> criar(@RequestBody T entidade, Contexto ctx) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service().criar(entidade, ctx));
    }

    @PutMapping("/{id}")
    public T atualizar(@PathVariable Long id, @RequestBody T entidade, Contexto ctx) {
        return service().atualizar(id, entidade, ctx);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id, Contexto ctx) {
        service().excluir(id, ctx);
        return ResponseEntity.noContent().build();
    }
}
