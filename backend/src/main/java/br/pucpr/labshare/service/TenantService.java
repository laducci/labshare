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
@Service
public class TenantService {

    /** Recursos variáveis que existem na Linha de Produto. */
    public static final Set<String> RECURSOS_CONHECIDOS =
            Set.of(Tenant.APROVACAO_GESTOR, Tenant.CENTRO_CUSTO, Tenant.MULTA_ATRASO);

    private final TenantDao dao;
    private final HistoricoService historico;
    private final FeatureFlagCache cache = FeatureFlagCache.getInstance();

    public TenantService(TenantDao dao, HistoricoService historico) {
        this.dao = dao;
        this.historico = historico;
    }

    public List<Tenant> listar() {
        List<Tenant> tenants = dao.listar();
        tenants.forEach(t -> t.setFeatures(new java.util.LinkedHashMap<>(recursos(t.getId()))));
        return tenants;
    }

    public Tenant buscar(String tenantId) {
        Tenant t = dao.buscarPorId(tenantId).orElseThrow(() -> new NaoEncontradoException("Cliente", tenantId));
        t.setFeatures(new java.util.LinkedHashMap<>(recursos(tenantId)));
        return t;
    }

    /** 1º procura no cache (Singleton); se não tiver, busca no banco e guarda no cache. */
    public Map<String, Boolean> recursos(String tenantId) {
        return cache.obter(tenantId).orElseGet(() -> {
            Map<String, Boolean> doBanco = dao.carregarRecursos(tenantId);
            cache.armazenar(tenantId, doBanco);
            return doBanco;
        });
    }

    public boolean possuiRecurso(String tenantId, String recurso) {
        return Boolean.TRUE.equals(recursos(tenantId).get(recurso));
    }

    /** Usado pelos módulos exclusivos (multas, centro de custo, aprovações). */
    public void exigirRecurso(String tenantId, String recurso) {
        if (!possuiRecurso(tenantId, recurso)) {
            throw new AcessoNegadoException("Este módulo não está habilitado para o seu cliente (" + recurso + ").");
        }
    }

    /** Tela "Personalização por cliente": liga/desliga recursos SEM alterar código. */
    public Tenant atualizarRecursos(String tenantId, Map<String, Boolean> novos, Contexto ctx) {
        buscar(tenantId); // garante que o cliente existe
        novos.forEach((recurso, habilitado) -> {
            if (!RECURSOS_CONHECIDOS.contains(recurso)) {
                throw new IllegalArgumentException("Recurso desconhecido: " + recurso);
            }
            dao.salvarRecurso(tenantId, recurso, Boolean.TRUE.equals(habilitado));
        });
        cache.invalidar(tenantId); // próxima leitura busca o valor novo no banco
        historico.registrar(new Contexto(tenantId, ctx.usuarioId()), "tenant", null, "PERSONALIZACAO",
                "Recursos alterados: " + novos);
        return buscar(tenantId);
    }
}
