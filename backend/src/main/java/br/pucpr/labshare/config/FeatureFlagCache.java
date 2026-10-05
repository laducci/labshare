/*
 * ============================================================
 *  FeatureFlagCache.java  |  Camada: Config (cache global)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Singleton, exemplo 2 de 2), Q2 (variabilidade / hasFeature)
 * ------------------------------------------------------------
 *  O que faz: guarda em memória quais recursos (feature flags) cada cliente tem
 *  ligados: approvalRequired, costCenter, lateFee. Evita ir à tabela
 *  tenant_recurso em toda requisição.
 *  Quem chama: TenantService (obter / armazenar / invalidar). Os demais
 *              (SeletorDeRegras, CrudService, Services) consultam via TenantService.
 *  Chama: ninguém (é só um Map em memória).
 * ============================================================
 */
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
 * Onde é usado: TenantService diretamente; SeletorDeRegras (Strategy) e CrudService
 * indiretamente, perguntando ao TenantService se o cliente possui o recurso.
 */
public final class FeatureFlagCache {

    // SINGLETON eager: o objeto é criado uma vez quando a JVM carrega a classe.
    private static final FeatureFlagCache INSTANCIA = new FeatureFlagCache();

    /** tenantId -> { "lateFee": true, "costCenter": false, ... } */
    // ConcurrentHashMap: Map seguro para várias requisições lerem/escreverem ao mesmo tempo.
    private final Map<String, Map<String, Boolean>> cache = new ConcurrentHashMap<>();

    // Construtor privado: ninguém de fora consegue fazer "new FeatureFlagCache()".
    private FeatureFlagCache() {
        System.out.println("[Singleton] FeatureFlagCache criado UMA vez.");
    }

    // Ponto global de acesso: devolve sempre o mesmo objeto.
    public static FeatureFlagCache getInstance() {
        return INSTANCIA;
    }

    // Lê os recursos do cliente. Optional vazio = ainda não está no cache (TenantService vai ao banco).
    public Optional<Map<String, Boolean>> obter(String tenantId) {
        return Optional.ofNullable(cache.get(tenantId));
    }

    // Guarda os recursos lidos do banco. Map.copyOf cria uma cópia imutável (ninguém altera por fora).
    public void armazenar(String tenantId, Map<String, Boolean> recursos) {
        cache.put(tenantId, Map.copyOf(recursos));
    }

    // Remove o cliente do cache depois que o admin muda algo na tela "Personalização".
    public void invalidar(String tenantId) {
        cache.remove(tenantId);
    }

    // Quantos clientes estão em cache (útil para conferir/demonstrar o cache).
    public int quantidadeEmCache() {
        return cache.size();
    }
}
