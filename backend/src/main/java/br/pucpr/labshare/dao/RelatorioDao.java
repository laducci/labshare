package br.pucpr.labshare.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.LinkedHashMap;
import java.util.Map;

/** Métricas operacionais para o dashboard da coordenação (handoff, seção 36). */
@Repository
public class RelatorioDao {

    private final JdbcTemplate jdbc;

    public RelatorioDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Ex.: SELECT status, COUNT(*) FROM equipamento WHERE tenant_id = ? GROUP BY status */
    public Map<String, Long> contarPorStatus(String tabela, String tenantId) {
        if (!tabela.matches("[a-z_]+")) throw new IllegalArgumentException("tabela inválida");
        Map<String, Long> resultado = new LinkedHashMap<>();
        jdbc.query("SELECT status, COUNT(*) AS total FROM " + tabela
                        + " WHERE tenant_id = ? AND ativo = TRUE GROUP BY status ORDER BY status",
                rs -> {
                    resultado.put(rs.getString("status"), rs.getLong("total"));
                }, tenantId);
        return resultado;
    }

    public Map<String, Long> equipamentosMaisReservados(String tenantId) {
        Map<String, Long> resultado = new LinkedHashMap<>();
        jdbc.query("SELECT e.nome, COUNT(r.id) AS total FROM equipamento e "
                        + "LEFT JOIN reserva r ON r.equipamento_id = e.id "
                        + "WHERE e.tenant_id = ? AND e.ativo = TRUE GROUP BY e.nome ORDER BY total DESC, e.nome LIMIT 5",
                rs -> {
                    resultado.put(rs.getString("nome"), rs.getLong("total"));
                }, tenantId);
        return resultado;
    }
}
