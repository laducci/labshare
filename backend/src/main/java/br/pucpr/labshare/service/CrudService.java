/*
 * ============================================================
 *  CrudService.java  |  Camada: Service (classe-base genérica)
 *  Responsável na apresentação: Todos  |  Atividade: Q3 (compactação de código / reuso), Q2 (variabilidade: recursoNecessario)
 * ------------------------------------------------------------
 *  O que faz: implementa UMA vez o fluxo de listar, buscar, criar, atualizar e
 *  excluir (exclusão lógica) para qualquer entidade. Os services concretos só
 *  sobrescrevem os ganchos de que precisam (validar, antesDeSalvar...).
 *  Quem chama: CrudController (GET/POST/PUT/DELETE genéricos) e os services filhos.
 *  Chama: AbstractDao (SQL), HistoricoService (RN11), TenantService (feature flags).
 * ============================================================
 */
package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.AbstractDao;
import br.pucpr.labshare.exception.NaoEncontradoException;
import br.pucpr.labshare.exception.RegraNegocioException;
import br.pucpr.labshare.model.EntidadeBase;

import java.util.List;

/**
 * Serviço genérico de CRUD (REUSO / COMPACTAÇÃO DE CÓDIGO).
 *
 * O fluxo de criar/atualizar/excluir é sempre o mesmo:
 *   verificar recurso do cliente -> validar -> ajustar antes de salvar -> gravar (DAO) -> registrar histórico.
 * Cada serviço concreto só sobrescreve os "ganchos" que precisa (validar, antesDeSalvar...).
 * É a mesma ideia do Template Method, aplicada à camada de regras de negócio.
 */
// <T extends EntidadeBase>: genérico; T pode ser Equipamento, Reserva, Categoria... desde que
// herde de EntidadeBase (que garante id, tenantId e ativo). Sem @Service: é abstrata, só os filhos viram beans.
public abstract class CrudService<T extends EntidadeBase> {

    // protected: os services filhos usam diretamente dao, historico e tenants.
    protected final AbstractDao<T> dao;
    protected final HistoricoService historico;
    protected final TenantService tenants;

    // Os filhos chamam super(dao, historico, tenants) no próprio construtor (injeção pelo construtor).
    protected CrudService(AbstractDao<T> dao, HistoricoService historico, TenantService tenants) {
        this.dao = dao;
        this.historico = historico;
        this.tenants = tenants;
    }

    /** Nome usado no histórico e nas mensagens. Ex.: "equipamento" */
    // Único método abstrato: todo filho é obrigado a implementar.
    protected abstract String nomeEntidade();

    // ------------------ GANCHOS (padrão: não fazem nada) ------------------

    /** Regras de validação da entidade. */
    protected void validar(T entidade, Contexto ctx) {}

    /** Ajustes antes de gravar. "existente" é null na criação. */
    protected void antesDeSalvar(T entidade, T existente, Contexto ctx) {}

    // Ações extras logo após o INSERT (ex.: reserva marca o equipamento como Reservado).
    protected void depoisDeCriar(T entidade, Contexto ctx) {}

    // Validações antes de desativar (ex.: não desativar equipamento em uso).
    protected void antesDeExcluir(T existente, Contexto ctx) {}

    /** VARIABILIDADE: se retornar um recurso, o módulo só funciona para clientes que o têm ligado. */
    protected String recursoNecessario() {
        return null;
    }

    // ------------------ OPERAÇÕES DO CRUD ------------------

    // GET /api/{entidade} -> lista só os registros ativos do cliente logado (WHERE tenant_id = ? AND ativo = TRUE).
    public List<T> listar(Contexto ctx) {
        verificarRecurso(ctx);
        return dao.listar(ctx.tenantId());
    }

    // GET /api/{entidade}/{id} -> busca um registro; se não existir (ou for de outro cliente) -> 404.
    public T buscar(Long id, Contexto ctx) {
        verificarRecurso(ctx);
        return dao.buscarPorId(id, ctx.tenantId())
                .orElseThrow(() -> new NaoEncontradoException(nomeEntidade(), id));
    }

    // POST /api/{entidade} (botão "Salvar" de um formulário de cadastro).
    // O id e o tenantId vindos da tela são ignorados: o servidor é quem define (segurança multi-cliente).
    public T criar(T entidade, Contexto ctx) {
        verificarRecurso(ctx);
        entidade.setId(null);
        entidade.setTenantId(ctx.tenantId());
        entidade.setAtivo(true);
        validar(entidade, ctx);
        antesDeSalvar(entidade, null, ctx);
        dao.inserir(entidade);                                   // -> INSERT INTO ...
        historico.registrar(ctx, nomeEntidade(), entidade.getId(), "CRIACAO", "Cadastro de " + nomeEntidade());
        depoisDeCriar(entidade, ctx);
        return buscar(entidade.getId(), ctx);
    }

    // PUT /api/{entidade}/{id} (botão "Salvar" na edição). Busca o existente primeiro (garante que é do cliente).
    public T atualizar(Long id, T entidade, Contexto ctx) {
        T existente = buscar(id, ctx);
        entidade.setId(id);
        entidade.setTenantId(ctx.tenantId());
        entidade.setAtivo(true);
        validar(entidade, ctx);
        antesDeSalvar(entidade, existente, ctx);
        dao.atualizar(entidade);                                 // -> UPDATE ... SET ...
        historico.registrar(ctx, nomeEntidade(), id, "ATUALIZACAO", "Edição de " + nomeEntidade());
        return buscar(id, ctx);
    }

    // DELETE /api/{entidade}/{id} -> exclusão LÓGICA: só marca ativo = FALSE, o registro
    // continua no banco para não quebrar o histórico e as reservas antigas (RN11).
    public void excluir(Long id, Contexto ctx) {
        T existente = buscar(id, ctx);
        antesDeExcluir(existente, ctx);
        dao.desativar(id, ctx.tenantId());                       // -> UPDATE ... SET ativo = FALSE
        historico.registrar(ctx, nomeEntidade(), id, "DESATIVACAO", "Desativação de " + nomeEntidade());
    }

    // ------------------ utilitários para as subclasses ------------------

    // Se o módulo exige um recurso (feature flag) e o cliente não tem -> AcessoNegadoException (HTTP 403).
    protected void verificarRecurso(Contexto ctx) {
        String recurso = recursoNecessario();
        if (recurso != null) {
            tenants.exigirRecurso(ctx.tenantId(), recurso);
        }
    }

    // Campo obrigatório: null ou texto em branco -> RegraNegocioException -> HTTP 400 {erro}.
    protected static void obrigatorio(Object valor, String campo) {
        if (valor == null || (valor instanceof String s && s.isBlank())) {
            throw new RegraNegocioException("O campo \"" + campo + "\" é obrigatório.");
        }
    }

    // Atalho para regras de negócio: se a condição for falsa, lança o erro com a mensagem dada.
    protected static void exigir(boolean condicao, String mensagem) {
        if (!condicao) {
            throw new RegraNegocioException(mensagem);
        }
    }
}
