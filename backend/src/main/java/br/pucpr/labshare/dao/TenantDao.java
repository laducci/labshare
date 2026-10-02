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
@Repository
public class TenantDao {

    private static final Logger log = LoggerFactory.getLogger(TenantDao.class);
    private final JdbcTemplate jdbc;

    public TenantDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Tenant> listar() {
        return jdbc.query("SELECT id, nome, segmento FROM tenant ORDER BY nome",
                (rs, n) -> new Tenant(rs.getString("id"), rs.getString("nome"), rs.getString("segmento")));
    }

    public Optional<Tenant> buscarPorId(String id) {
        return jdbc.query("SELECT id, nome, segmento FROM tenant WHERE id = ?",
                (rs, n) -> new Tenant(rs.getString("id"), rs.getString("nome"), rs.getString("segmento")), id)
                .stream().findFirst();
    }

    /** VARIABILIDADE: lê da tabela tenant_recurso quais recursos o cliente tem ligados. */
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
    public void salvarRecurso(String tenantId, String recurso, boolean habilitado) {
        String sql = "INSERT INTO tenant_recurso (tenant_id, recurso, habilitado) VALUES (?, ?, ?) "
                   + "ON CONFLICT (tenant_id, recurso) DO UPDATE SET habilitado = EXCLUDED.habilitado";
        log.info("[SQL] {}  | valores = [{}, {}, {}]", sql, tenantId, recurso, habilitado);
        jdbc.update(sql, tenantId, recurso, habilitado);
    }
}
