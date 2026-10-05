/*
 * ============================================================
 *  RelatorioDao.java  |  Camada: DAO (consultas de relatório, somente leitura)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (Dashboard com dados do banco)
 * ------------------------------------------------------------
 *  O que faz: consultas agregadas (COUNT / GROUP BY) para os números do Dashboard:
 *  quantos equipamentos, reservas, ocorrências e manutenções existem em cada
 *  status, e os 5 equipamentos mais reservados.
 *  Não herda do AbstractDao porque não representa uma entidade (não tem CRUD).
 *  Quem chama: ConsultaController (GET /api/relatorios/resumo) <- tela Dashboard (front).
 *  Chama: JdbcTemplate -> PostgreSQL.
 * ============================================================
 */
package br.pucpr.labshare.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.LinkedHashMap;
import java.util.Map;

/** Métricas operacionais para o dashboard da coordenação (handoff, seção 36). */
// @Repository: componente de acesso a dados criado e injetado pelo Spring.
@Repository
public class RelatorioDao {

    private final JdbcTemplate jdbc;

    // Injeção pelo construtor: o Spring entrega o JdbcTemplate já configurado.
    public RelatorioDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Ex.: SELECT status, COUNT(*) FROM equipamento WHERE tenant_id = ? GROUP BY status */
    // Conta registros ativos do cliente agrupados por status. Resultado: {"DISPONIVEL": 4, "EM_USO": 2, ...}.
    // O nome da tabela NÃO pode ir como "?" (o JDBC só parametriza valores, não nomes de tabela),
    // por isso a regex "[a-z_]+" aceita só letras minúsculas e "_" e bloqueia SQL Injection.
    // LinkedHashMap mantém a ordem do ORDER BY.
    public Map<String, Long> contarPorStatus(String tabela, String tenantId) {
        if (!tabela.matches("[a-z_]+")) throw new IllegalArgumentException("tabela inválida");
        Map<String, Long> resultado = new LinkedHashMap<>();
        // RowCallbackHandler (lambda "rs -> {...}"): é chamado uma vez por linha e vai preenchendo o Map.
        jdbc.query("SELECT status, COUNT(*) AS total FROM " + tabela
                        + " WHERE tenant_id = ? AND ativo = TRUE GROUP BY status ORDER BY status",
                rs -> {
                    resultado.put(rs.getString("status"), rs.getLong("total"));
                }, tenantId);
        return resultado;
    }

    // Top 5 equipamentos com mais reservas do cliente.
    // LEFT JOIN para incluir também equipamentos com zero reservas; COUNT(r.id) conta só as reservas existentes.
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
