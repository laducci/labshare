/*
 * ============================================================
 *  TenantDao.java  |  Camada: DAO (acesso ao banco, tabelas tenant e tenant_recurso)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (exemplo de variabilidade: tenant_recurso / hasFeature)
 * ------------------------------------------------------------
 *  O que faz: lê os clientes (tenants) e, principalmente, os RECURSOS (feature flags)
 *  que cada cliente tem ligados na tabela tenant_recurso: approvalRequired,
 *  costCenter e lateFee. É daqui que vem a variabilidade da Linha de Produto:
 *  o mesmo código se comporta diferente para Universidade, Empresa e Escola Técnica.
 *  Quem chama: TenantService (que guarda o resultado no Singleton FeatureFlagCache)
 *              <- TenantController <- tela TenantSettings / "Personalização" (front).
 *  Chama: JdbcTemplate -> PostgreSQL.
 * ============================================================
 */
package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Tenant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Clientes e seus recursos (feature flags). Não usa o AbstractDao porque o id é texto e não há tenant_id. */
// @Repository: componente de acesso a dados criado e injetado pelo Spring (no TenantService).
@Repository
public class TenantDao {

    private static final Logger log = LoggerFactory.getLogger(TenantDao.class);
    private final JdbcTemplate jdbc;

    // Injeção pelo construtor: o Spring entrega o JdbcTemplate já configurado.
    public TenantDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Lista todos os clientes (usado na escolha de cliente / login de demonstração).
    // Tenant é um record, por isso é criado direto com "new Tenant(id, nome, segmento)".
    public List<Tenant> listar() {
        return jdbc.query("SELECT id, nome, segmento FROM tenant ORDER BY nome",
                (rs, n) -> new Tenant(rs.getString("id"), rs.getString("nome"), rs.getString("segmento")));
    }

    // Busca um cliente pelo id (ex.: "universidade"). Optional vazio se não existir.
    public Optional<Tenant> buscarPorId(String id) {
        return jdbc.query("SELECT id, nome, segmento FROM tenant WHERE id = ?",
                (rs, n) -> new Tenant(rs.getString("id"), rs.getString("nome"), rs.getString("segmento")), id)
                .stream().findFirst();
    }

    /** VARIABILIDADE: lê da tabela tenant_recurso quais recursos o cliente tem ligados. */
    // Resultado, ex. para "empresa": {"approvalRequired": true, "costCenter": true, "lateFee": false}.
    // O TenantService só chama isto quando o cliente NÃO está no FeatureFlagCache (Singleton).
    public Map<String, Boolean> carregarRecursos(String tenantId) {
        String sql = "SELECT recurso, habilitado FROM tenant_recurso WHERE tenant_id = ? ORDER BY recurso";
        log.info("[SQL] {}  | valores = [{}]", sql, tenantId);
        Map<String, Boolean> recursos = new LinkedHashMap<>();
        jdbc.query(sql, rs -> {
            recursos.put(rs.getString("recurso"), rs.getBoolean("habilitado"));
        }, tenantId);
        return recursos;
    }

    /** Liga/desliga um recurso. "ON CONFLICT ... DO UPDATE" = insere ou atualiza (upsert). */
    // Chamado quando o admin salva a tela "Personalização" -> PUT /api/tenants/{id}/recursos -> TenantService.
    // Se a linha (tenant_id, recurso) já existe, só atualiza "habilitado"; se não existe, insere.
    // EXCLUDED = a linha que tentamos inserir. Depois disso o TenantService invalida o cache.
    public void salvarRecurso(String tenantId, String recurso, boolean habilitado) {
        String sql = "INSERT INTO tenant_recurso (tenant_id, recurso, habilitado) VALUES (?, ?, ?) "
                   + "ON CONFLICT (tenant_id, recurso) DO UPDATE SET habilitado = EXCLUDED.habilitado";
        log.info("[SQL] {}  | valores = [{}, {}, {}]", sql, tenantId, recurso, habilitado);
        jdbc.update(sql, tenantId, recurso, habilitado);
    }
}
