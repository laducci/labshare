/*
 * ============================================================
 *  CrudController.java  |  Camada: Controller (API REST genérica)
 *  Responsável na apresentação: Todos  |  Atividade: Q3 (compactação/reuso), Q2 (telas CRUD com banco)
 * ------------------------------------------------------------
 *  O que faz: classe-mãe abstrata de todos os controllers de cadastro. Define UMA vez as
 *  5 rotas do CRUD (listar, buscar, criar, atualizar, excluir); cada controller concreto
 *  só herda daqui e diz qual Service usar. É o principal exemplo de reuso no backend (RNF08).
 *  Quem chama: o React via services/api.js (fetch) -> Vite proxy /api -> Spring.
 *  Chama: CrudService (criar/atualizar/excluir/listar/buscar) -> AbstractDao -> PostgreSQL.
 * ============================================================
 */
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
 *
 * Por que não tem @RestController aqui? Porque esta classe é abstrata e não atende nenhuma URL
 * sozinha. O @RestController e o @RequestMapping("/api/xxx") ficam na subclasse; o Spring junta
 * o prefixo da subclasse com os caminhos dos métodos herdados abaixo.
 *
 * <T extends EntidadeBase>: o tipo genérico garante que só entidades com id/tenantId/ativo
 * (campos de EntidadeBase) podem usar este CRUD.
 *
 * Parâmetro "Contexto ctx": não vem da URL nem do corpo. Ele é montado pelo ContextoResolver
 * a partir dos cabeçalhos X-Tenant-Id e X-Usuario-Id enviados pelo api.js depois do login.
 * Sem esses cabeçalhos o TratadorDeErros responde 401 ("Faça login para continuar").
 */
public abstract class CrudController<T extends EntidadeBase> {

    /** Cada controller concreto informa qual serviço usar. */
    // Este é o "gancho" que a subclasse preenche (ex.: CategoriaController devolve o CategoriaService).
    protected abstract CrudService<T> service();

    // GET /api/{recurso} -> lista os registros ATIVOS do cliente (tenant) logado.
    // @GetMapping sem caminho = usa só o prefixo do @RequestMapping da subclasse.
    // O retorno (List<T>) é convertido automaticamente em JSON pelo Jackson.
    @GetMapping
    public List<T> listar(Contexto ctx) {
        return service().listar(ctx);
    }

    // GET /api/{recurso}/{id} -> busca um registro. @PathVariable pega o {id} da URL e converte para Long.
    // Se não existir (ou for de outro tenant), o Service lança NaoEncontradoException -> HTTP 404.
    @GetMapping("/{id}")
    public T buscar(@PathVariable Long id, Contexto ctx) {
        return service().buscar(id, ctx);
    }

    // POST /api/{recurso} -> cria um registro. @RequestBody converte o JSON enviado pelo React em objeto T.
    // Responde 201 CREATED (padrão REST para "criado") com o objeto salvo, já com o id gerado pelo banco.
    @PostMapping
    public ResponseEntity<T> criar(@RequestBody T entidade, Contexto ctx) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service().criar(entidade, ctx));
    }

    // PUT /api/{recurso}/{id} -> atualiza o registro {id} com os dados do JSON (vira UPDATE no DAO).
    @PutMapping("/{id}")
    public T atualizar(@PathVariable Long id, @RequestBody T entidade, Contexto ctx) {
        return service().atualizar(id, entidade, ctx);
    }

    // DELETE /api/{recurso}/{id} -> EXCLUSÃO LÓGICA: o Service chama dao.desativar (UPDATE ... SET ativo = FALSE),
    // então o registro some das listagens mas continua no banco para manter o histórico (RN11, RNF10).
    // Responde 204 No Content (deu certo, sem corpo de resposta).
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id, Contexto ctx) {
        service().excluir(id, ctx);
        return ResponseEntity.noContent().build();
    }
}
