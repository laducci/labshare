/*
 * ============================================================
 *  TenantService.java  |  Camada: Service (regras de negócio)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (variabilidade: tenant_recurso, hasFeature, Personalização), Q1 (usa Singleton FeatureFlagCache)
 * ------------------------------------------------------------
 *  O que faz: responde "este cliente (tenant) tem o recurso X ligado?" lendo a
 *  tabela tenant_recurso, com cache no Singleton FeatureFlagCache. Também liga/
 *  desliga recursos pela tela "Personalização por cliente" sem mudar código.
 *  Quem chama: TenantController (/api/tenants; telas TenantSettings e AppContext),
 *              AuthService, CrudService, SeletorDeRegras, ReservaService, UsuarioService.
 *  Chama: TenantDao (SELECT/INSERT em tenant e tenant_recurso), FeatureFlagCache, HistoricoService.
 * ============================================================
 */
package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.config.FeatureFlagCache;
import br.pucpr.labshare.dao.TenantDao;
import br.pucpr.labshare.exception.AcessoNegadoException;
import br.pucpr.labshare.exception.NaoEncontradoException;
import br.pucpr.labshare.model.Tenant;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * VARIABILIDADE: centraliza a pergunta "este cliente tem o recurso X ligado?".
 * Usa o Singleton FeatureFlagCache para não ir ao banco em toda requisição.
 */
// @Service: bean do Spring; é injetado em quase todos os services que dependem de feature flags.
@Service
public class TenantService {

    /** Recursos variáveis que existem na Linha de Produto. */
    // approvalRequired, costCenter e lateFee: qualquer outro nome é rejeitado em atualizarRecursos.
    public static final Set<String> RECURSOS_CONHECIDOS =
            Set.of(Tenant.APROVACAO_GESTOR, Tenant.CENTRO_CUSTO, Tenant.MULTA_ATRASO);

    private final TenantDao dao;
    private final HistoricoService historico;
    // SINGLETON: não é injetado pelo Spring; pega a instância única via getInstance().
    private final FeatureFlagCache cache = FeatureFlagCache.getInstance();

    // Injeção pelo construtor.
    public TenantService(TenantDao dao, HistoricoService historico) {
        this.dao = dao;
        this.historico = historico;
    }

    // GET /api/tenants (tela TenantSettings): todos os clientes, cada um com seu mapa de recursos.
    public List<Tenant> listar() {
        List<Tenant> tenants = dao.listar();
        tenants.forEach(t -> t.setFeatures(new java.util.LinkedHashMap<>(recursos(t.getId()))));
        return tenants;
    }

    // GET /api/tenants/atual e login: dados do cliente + recursos (o front usa isso no hasFeature).
    public Tenant buscar(String tenantId) {
        Tenant t = dao.buscarPorId(tenantId).orElseThrow(() -> new NaoEncontradoException("Cliente", tenantId));
        t.setFeatures(new java.util.LinkedHashMap<>(recursos(tenantId)));
        return t;
    }

    /** 1º procura no cache (Singleton); se não tiver, busca no banco e guarda no cache. */
    // orElseGet só executa a busca no banco quando o cache estiver vazio para esse cliente.
    public Map<String, Boolean> recursos(String tenantId) {
        return cache.obter(tenantId).orElseGet(() -> {
            Map<String, Boolean> doBanco = dao.carregarRecursos(tenantId);
            cache.armazenar(tenantId, doBanco);
            return doBanco;
        });
    }

    // Equivalente no backend ao hasFeature do front. Boolean.TRUE.equals evita erro se o valor for null.
    public boolean possuiRecurso(String tenantId, String recurso) {
        return Boolean.TRUE.equals(recursos(tenantId).get(recurso));
    }

    /** Usado pelos módulos exclusivos (multas, centro de custo, aprovações). */
    // Lança AcessoNegadoException, que o TratadorDeErros transforma em HTTP 403.
    public void exigirRecurso(String tenantId, String recurso) {
        if (!possuiRecurso(tenantId, recurso)) {
            throw new AcessoNegadoException("Este módulo não está habilitado para o seu cliente (" + recurso + ").");
        }
    }

    /** Tela "Personalização por cliente": liga/desliga recursos SEM alterar código. */
    // Botão salvar da TenantSettings -> PUT /api/tenants/{id}/recursos com {"lateFee": true, ...}.
    public Tenant atualizarRecursos(String tenantId, Map<String, Boolean> novos, Contexto ctx) {
        buscar(tenantId); // garante que o cliente existe
        novos.forEach((recurso, habilitado) -> {
            if (!RECURSOS_CONHECIDOS.contains(recurso)) {
                throw new IllegalArgumentException("Recurso desconhecido: " + recurso);
            }
            // Grava a linha em tenant_recurso (INSERT ... ON CONFLICT DO UPDATE: insere ou atualiza).
            dao.salvarRecurso(tenantId, recurso, Boolean.TRUE.equals(habilitado));
        });
        cache.invalidar(tenantId); // próxima leitura busca o valor novo no banco
        // RN11: registra no histórico do cliente alterado quem mudou e o quê.
        historico.registrar(new Contexto(tenantId, ctx.usuarioId()), "tenant", null, "PERSONALIZACAO",
                "Recursos alterados: " + novos);
        return buscar(tenantId);
    }
}
