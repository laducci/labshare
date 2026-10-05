/*
 * ============================================================
 *  HistoricoDao.java  |  Camada: DAO (acesso ao banco, tabela historico)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (rastreabilidade RN11 / RNF10)
 * ------------------------------------------------------------
 *  O que faz: grava e consulta o histórico de ações (quem fez o quê, quando e em
 *  qual registro). Cada criação, alteração, retirada, devolução etc. vira uma linha.
 *  Não herda do AbstractDao porque o histórico nunca é editado nem excluído
 *  (não tem UPDATE nem coluna "ativo").
 *  Quem chama: HistoricoService (chamado pelos outros Services) e
 *              ConsultaController (GET /api/historico).
 *  Chama: JdbcTemplate -> PostgreSQL.
 * ============================================================
 */
package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Historico;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/** Rastreabilidade (RNF10). Só insere e consulta: histórico nunca é alterado. */
// @Repository: componente de acesso a dados criado e injetado pelo Spring (no HistoricoService).
@Repository
public class HistoricoDao {

    private final JdbcTemplate jdbc;

    // Injeção pelo construtor: o Spring entrega o JdbcTemplate já configurado.
    public HistoricoDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Grava uma ação no histórico (RN11). Os "?" são preenchidos na ordem pelos valores
    // seguintes (PreparedStatement, evita SQL Injection). tenant_id separa por cliente.
    public void registrar(Historico h) {
        jdbc.update("INSERT INTO historico (tenant_id, entidade, entidade_id, acao, descricao, usuario_id) VALUES (?, ?, ?, ?, ?, ?)",
                h.getTenantId(), h.getEntidade(), h.getEntidadeId(), h.getAcao(), h.getDescricao(), h.getUsuarioId());
    }

    // Lista o histórico do cliente, com filtros opcionais (ex.: só da reserva 5).
    // O SQL é montado aos poucos: cada filtro informado acrescenta "AND ... = ?" e o valor
    // correspondente na lista de parâmetros, mantendo a mesma ordem dos "?".
    // LEFT JOIN com usuario para mostrar o nome de quem fez a ação. LIMIT 200 evita respostas enormes.
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
        // RowMapper em forma de lambda: converte cada linha do resultado em um objeto Historico.
        return jdbc.query(sql.toString(), (rs, n) -> {
            Historico h = new Historico();
            h.setId(rs.getLong("id"));
            h.setTenantId(rs.getString("tenant_id"));
            h.setEntidade(rs.getString("entidade"));
            // getLong devolve 0 quando a coluna é NULL; wasNull() confere para guardar null de verdade.
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
