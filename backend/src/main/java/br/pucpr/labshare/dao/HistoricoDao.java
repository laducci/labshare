package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Historico;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/** Rastreabilidade (RNF10). Só insere e consulta: histórico nunca é alterado. */
@Repository
public class HistoricoDao {

    private final JdbcTemplate jdbc;

    public HistoricoDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void registrar(Historico h) {
        jdbc.update("INSERT INTO historico (tenant_id, entidade, entidade_id, acao, descricao, usuario_id) VALUES (?, ?, ?, ?, ?, ?)",
                h.getTenantId(), h.getEntidade(), h.getEntidadeId(), h.getAcao(), h.getDescricao(), h.getUsuarioId());
    }

    public List<Historico> listar(String tenantId, String entidade, Long entidadeId) {
        StringBuilder sql = new StringBuilder(
                "SELECT h.*, u.nome AS usuario_nome FROM historico h LEFT JOIN usuario u ON u.id = h.usuario_id WHERE h.tenant_id = ?");
        List<Object> params = new java.util.ArrayList<>(List.of(tenantId));
        if (entidade != null) {
            sql.append(" AND h.entidade = ?");
            params.add(entidade);
        }
        if (entidadeId != null) {
            sql.append(" AND h.entidade_id = ?");
            params.add(entidadeId);
        }
        sql.append(" ORDER BY h.data_hora DESC, h.id DESC LIMIT 200");
        return jdbc.query(sql.toString(), (rs, n) -> {
            Historico h = new Historico();
            h.setId(rs.getLong("id"));
            h.setTenantId(rs.getString("tenant_id"));
            h.setEntidade(rs.getString("entidade"));
            long eid = rs.getLong("entidade_id");
            h.setEntidadeId(rs.wasNull() ? null : eid);
            h.setAcao(rs.getString("acao"));
            h.setDescricao(rs.getString("descricao"));
            long uid = rs.getLong("usuario_id");
            h.setUsuarioId(rs.wasNull() ? null : uid);
            h.setUsuarioNome(rs.getString("usuario_nome"));
            h.setDataHora(rs.getObject("data_hora", LocalDateTime.class));
            return h;
        }, params.toArray());
    }
}
