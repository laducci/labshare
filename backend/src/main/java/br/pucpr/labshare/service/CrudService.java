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
public abstract class CrudService<T extends EntidadeBase> {

    protected final AbstractDao<T> dao;
    protected final HistoricoService historico;
    protected final TenantService tenants;

    protected CrudService(AbstractDao<T> dao, HistoricoService historico, TenantService tenants) {
        this.dao = dao;
        this.historico = historico;
        this.tenants = tenants;
    }

    /** Nome usado no histórico e nas mensagens. Ex.: "equipamento" */
    protected abstract String nomeEntidade();

    // ------------------ GANCHOS (padrão: não fazem nada) ------------------

    /** Regras de validação da entidade. */
    protected void validar(T entidade, Contexto ctx) {}

    /** Ajustes antes de gravar. "existente" é null na criação. */
    protected void antesDeSalvar(T entidade, T existente, Contexto ctx) {}

    protected void depoisDeCriar(T entidade, Contexto ctx) {}

    protected void antesDeExcluir(T existente, Contexto ctx) {}

    /** VARIABILIDADE: se retornar um recurso, o módulo só funciona para clientes que o têm ligado. */
    protected String recursoNecessario() {
        return null;
    }

    // ------------------ OPERAÇÕES DO CRUD ------------------

    public List<T> listar(Contexto ctx) {
        verificarRecurso(ctx);
        return dao.listar(ctx.tenantId());
    }

    public T buscar(Long id, Contexto ctx) {
        verificarRecurso(ctx);
        return dao.buscarPorId(id, ctx.tenantId())
                .orElseThrow(() -> new NaoEncontradoException(nomeEntidade(), id));
    }

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

    public void excluir(Long id, Contexto ctx) {
        T existente = buscar(id, ctx);
        antesDeExcluir(existente, ctx);
        dao.desativar(id, ctx.tenantId());                       // -> UPDATE ... SET ativo = FALSE
        historico.registrar(ctx, nomeEntidade(), id, "DESATIVACAO", "Desativação de " + nomeEntidade());
    }

    // ------------------ utilitários para as subclasses ------------------

    protected void verificarRecurso(Contexto ctx) {
        String recurso = recursoNecessario();
        if (recurso != null) {
            tenants.exigirRecurso(ctx.tenantId(), recurso);
        }
    }

    protected static void obrigatorio(Object valor, String campo) {
        if (valor == null || (valor instanceof String s && s.isBlank())) {
            throw new RegraNegocioException("O campo \"" + campo + "\" é obrigatório.");
        }
    }

    protected static void exigir(boolean condicao, String mensagem) {
        if (!condicao) {
            throw new RegraNegocioException(mensagem);
        }
    }
}
