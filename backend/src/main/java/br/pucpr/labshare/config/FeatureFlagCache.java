package br.pucpr.labshare.config;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ============================================================
 *  PADRÃO DE PROJETO: SINGLETON  (exemplo 2 de 2)
 * ============================================================
 * Problema: quase toda requisição precisa saber se o cliente tem um recurso ligado
 * (approvalRequired, costCenter, lateFee). Ir ao banco toda vez é desperdício,
 * e se cada classe tivesse o seu próprio cache, eles ficariam desatualizados entre si.
 *
 * Solução: um ÚNICO cache em memória, compartilhado por todo o sistema.
 * Diferente do ConfiguracaoEmprestimo, aqui a instância é criada já na carga da classe
 * (inicialização "ansiosa" / eager): "static final ... = new FeatureFlagCache()".
 * Isso já é thread-safe por natureza, sem precisar de synchronized.
 *
 * Quando o admin altera um recurso na tela "Personalização", o TenantService
 * chama invalidar(tenantId) e a próxima leitura busca o valor novo no banco.
 *
 * Onde é usado: TenantService, SeletorDeRegras (Strategy) e CrudService.
 */
public final class FeatureFlagCache {

    private static final FeatureFlagCache INSTANCIA = new FeatureFlagCache();

    /** tenantId -> { "lateFee": true, "costCenter": false, ... } */
    private final Map<String, Map<String, Boolean>> cache = new ConcurrentHashMap<>();

    private FeatureFlagCache() {
        System.out.println("[Singleton] FeatureFlagCache criado UMA vez.");
    }

    public static FeatureFlagCache getInstance() {
        return INSTANCIA;
    }

    public Optional<Map<String, Boolean>> obter(String tenantId) {
        return Optional.ofNullable(cache.get(tenantId));
    }

    public void armazenar(String tenantId, Map<String, Boolean> recursos) {
        cache.put(tenantId, Map.copyOf(recursos));
    }

    public void invalidar(String tenantId) {
        cache.remove(tenantId);
    }

    public int quantidadeEmCache() {
        return cache.size();
    }
}
