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

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
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

    // =====================================================================
    //  MEDIÇÃO — SAÍDAS EXTERNAS (SE). Cada método abaixo alimenta um relatório.
    //  O SQL só AGRUPA e CONTA; os cálculos derivados (percentuais, médias,
    //  multa estimada) ficam no RelatorioService — é essa lógica de processamento
    //  que faz o relatório ser uma SE (e não uma simples consulta/CE).
    //  queryForList devolve cada linha como um Map coluna -> valor.
    // =====================================================================

    /** SE (Laura): reservas, retiradas e dias ocupados por equipamento dentro do período. */
    public List<Map<String, Object>> utilizacaoPorEquipamento(String tenantId, LocalDate inicio, LocalDate fim) {
        String sql = "SELECT e.id, e.nome, e.patrimonio, c.nome AS categoria, "
                + "COUNT(r.id) AS reservas, COUNT(r.data_retirada) AS retiradas, "
                // dias de cada reserva que caem DENTRO do período (recorte pelo início e fim).
                // O CASE evita contar o período inteiro quando o equipamento não tem reserva
                // (no LEFT JOIN, r.id vem NULL e LEAST/GREATEST ignorariam o NULL).
                + "COALESCE(SUM(CASE WHEN r.id IS NULL THEN 0 "
                + "ELSE LEAST(r.data_fim, ?) - GREATEST(r.data_inicio, ?) + 1 END), 0) AS dias_ocupados "
                + "FROM equipamento e LEFT JOIN categoria c ON c.id = e.categoria_id "
                + "LEFT JOIN reserva r ON r.equipamento_id = e.id AND r.status IN ('AGENDADA', 'EM_USO', 'FINALIZADA') "
                + "AND r.data_inicio <= ? AND r.data_fim >= ? "
                + "WHERE e.tenant_id = ? AND e.ativo = TRUE "
                + "GROUP BY e.id, e.nome, e.patrimonio, c.nome ORDER BY dias_ocupados DESC, e.nome";
        return jdbc.queryForList(sql, fim, inicio, fim, inicio, tenantId);
    }

    /** SE (João): quantidade de equipamentos por categoria e por status. */
    public List<Map<String, Object>> equipamentosPorCategoria(String tenantId) {
        String sql = "SELECT c.nome AS categoria, c.grupo_patrimonial, COUNT(e.id) AS total, "
                + "COUNT(e.id) FILTER (WHERE e.status = 'DISPONIVEL') AS disponiveis, "
                + "COUNT(e.id) FILTER (WHERE e.status = 'RESERVADO') AS reservados, "
                + "COUNT(e.id) FILTER (WHERE e.status = 'EM_USO') AS em_uso, "
                + "COUNT(e.id) FILTER (WHERE e.status = 'EM_MANUTENCAO') AS em_manutencao, "
                + "COUNT(e.id) FILTER (WHERE e.status = 'INDISPONIVEL') AS indisponiveis "
                + "FROM categoria c LEFT JOIN equipamento e ON e.categoria_id = c.id AND e.ativo = TRUE "
                + "WHERE c.tenant_id = ? AND c.ativo = TRUE GROUP BY c.id, c.nome, c.grupo_patrimonial ORDER BY c.nome";
        return jdbc.queryForList(sql, tenantId);
    }

    /** SE (João): inventário de cada local (laboratório/sala). */
    public List<Map<String, Object>> inventarioPorLocal(String tenantId) {
        String sql = "SELECT l.nome AS local, l.codigo_sala, COUNT(e.id) AS total, "
                + "COUNT(e.id) FILTER (WHERE e.status = 'DISPONIVEL') AS disponiveis, "
                + "COUNT(e.id) FILTER (WHERE e.status IN ('RESERVADO', 'EM_USO')) AS emprestados, "
                + "COUNT(e.id) FILTER (WHERE e.status = 'EM_MANUTENCAO') AS em_manutencao "
                + "FROM local l LEFT JOIN equipamento e ON e.local_id = l.id AND e.ativo = TRUE "
                + "WHERE l.tenant_id = ? AND l.ativo = TRUE GROUP BY l.id, l.nome, l.codigo_sala ORDER BY l.nome";
        return jdbc.queryForList(sql, tenantId);
    }

    /** SE (Camilla): manutenções por equipamento no período, com dias de reparo das concluídas. */
    public List<Map<String, Object>> indicadoresManutencao(String tenantId, LocalDate inicio, LocalDate fim) {
        String sql = "SELECT e.nome, e.patrimonio, COUNT(m.id) AS total, "
                + "COUNT(m.id) FILTER (WHERE m.status = 'CONCLUIDA') AS concluidas, "
                + "COUNT(m.id) FILTER (WHERE m.status <> 'CONCLUIDA') AS em_andamento, "
                + "COUNT(m.fornecedor_cnpj) AS com_assistencia_externa, "
                + "COALESCE(SUM(m.data_fim - m.data_inicio) FILTER (WHERE m.status = 'CONCLUIDA'), 0) AS dias_reparo "
                + "FROM manutencao m JOIN equipamento e ON e.id = m.equipamento_id "
                + "WHERE m.tenant_id = ? AND m.ativo = TRUE AND m.data_inicio BETWEEN ? AND ? "
                + "GROUP BY e.id, e.nome, e.patrimonio ORDER BY total DESC, e.nome";
        return jdbc.queryForList(sql, tenantId, inicio, fim);
    }

    /** SE (Camilla): multas por usuário, considerando a data de devolução dentro do período. */
    public List<Map<String, Object>> multasPorUsuario(String tenantId, LocalDate inicio, LocalDate fim) {
        String sql = "SELECT u.nome, u.email, COUNT(mu.id) AS quantidade, SUM(mu.dias_atraso) AS dias_atraso, "
                + "SUM(mu.valor) AS total, "
                + "COALESCE(SUM(mu.valor) FILTER (WHERE mu.status = 'PAGA'), 0) AS pago, "
                + "COALESCE(SUM(mu.valor) FILTER (WHERE mu.status = 'EM_ABERTO'), 0) AS em_aberto "
                + "FROM multa mu JOIN reserva r ON r.id = mu.reserva_id JOIN usuario u ON u.id = r.usuario_id "
                + "WHERE mu.tenant_id = ? AND mu.ativo = TRUE AND r.data_devolucao BETWEEN ? AND ? "
                + "GROUP BY u.id, u.nome, u.email ORDER BY total DESC";
        return jdbc.queryForList(sql, tenantId, inicio, fim);
    }
}
