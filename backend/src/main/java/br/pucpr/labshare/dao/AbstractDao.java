package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.EntidadeBase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * ============================================================
 *  PADRÃO DE PROJETO: TEMPLATE METHOD  (exemplo 1 de 3)
 * ============================================================
 * Todo CRUD faz sempre os MESMOS passos no banco:
 *   montar o SQL -> preencher os parâmetros -> executar -> converter a linha em objeto.
 * O que muda de uma tabela para outra é só: o nome da tabela, as colunas,
 * os valores e como ler os campos específicos.
 *
 * - Os MÉTODOS-TEMPLATE (listar, buscarPorId, inserir, atualizar, desativar) são "final":
 *   o algoritmo é fixo e igual para todas as entidades.
 * - Os PASSOS ABSTRATOS (tabela, colunas, valores, criarObjeto) são implementados
 *   por cada DAO concreto (CategoriaDao, EquipamentoDao, ReservaDao...).
 * - Os GANCHOS (joins, colunasExtras, ordenacao) têm um comportamento padrão
 *   e só são sobrescritos quando a entidade precisa (ex.: JOIN com categoria).
 *
 * Exemplo do que é gerado para EquipamentoDao.inserir(...):
 *   INSERT INTO equipamento (tenant_id, ativo, nome, descricao, patrimonio, status, ...)
 *   VALUES (?, ?, ?, ?, ?, ?, ...) RETURNING id
 *
 * Também é a base da COMPACTAÇÃO DE CÓDIGO: antes cada DAO tinha seu próprio
 * INSERT/UPDATE/SELECT escrito à mão (código duplicado); agora cada DAO tem ~30 linhas.
 */
public abstract class AbstractDao<T extends EntidadeBase> {

    protected final Logger log = LoggerFactory.getLogger(getClass());
    protected final JdbcTemplate jdbc;

    protected AbstractDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // =========================================================
    //  PASSOS ABSTRATOS: cada DAO concreto é obrigado a definir
    // =========================================================

    /** Nome da tabela no banco. Ex.: "categoria" */
    protected abstract String tabela();

    /** Colunas que o usuário pode gravar (sem id, tenant_id e ativo, que são comuns). */
    protected abstract List<String> colunas();

    /** Valores da entidade, NA MESMA ORDEM de colunas(). */
    protected abstract Object[] valores(T entidade);

    /** Converte uma linha do ResultSet nos campos específicos da entidade. */
    protected abstract T criarObjeto(ResultSet rs) throws SQLException;

    // =========================================================
    //  GANCHOS (hooks): opcionais, com comportamento padrão
    // =========================================================

    /** JOINs para trazer nomes de tabelas relacionadas. Padrão: nenhum. */
    protected String joins() {
        return "";
    }

    /** Colunas extras vindas dos JOINs. Ex.: ", c.nome AS categoria_nome" */
    protected String colunasExtras() {
        return "";
    }

    protected String ordenacao() {
        return "t.id";
    }

    // =========================================================
    //  MÉTODOS-TEMPLATE: o algoritmo fixo (final = não pode ser alterado)
    // =========================================================

    /** READ (lista): só registros ativos do cliente logado. */
    public final List<T> listar(String tenantId) {
        return buscarOnde(tenantId, null);
    }

    /** READ (um registro). */
    public final Optional<T> buscarPorId(Long id, String tenantId) {
        String sql = selectBase() + " WHERE t.id = ? AND t.tenant_id = ?";
        return consultar(sql, id, tenantId).stream().findFirst();
    }

    /** CREATE: monta o INSERT a partir das colunas e devolve a entidade com o id gerado. */
    public final T inserir(T entidade) {
        List<String> cols = colunas();
        String sql = "INSERT INTO " + tabela()
                + " (tenant_id, ativo, " + String.join(", ", cols) + ")"
                + " VALUES (?, ?, " + marcadores(cols.size()) + ") RETURNING id";

        Object[] params = juntar(new Object[]{entidade.getTenantId(), entidade.isAtivo()}, valores(entidade));
        logSql(sql, params);
        Long id = jdbc.queryForObject(sql, Long.class, params);
        entidade.setId(id);
        return entidade;
    }

    /** UPDATE: atualiza todas as colunas editáveis. */
    public final void atualizar(T entidade) {
        String sets = colunas().stream().map(c -> c + " = ?").collect(Collectors.joining(", "));
        String sql = "UPDATE " + tabela() + " SET " + sets + " WHERE id = ? AND tenant_id = ?";
        Object[] params = juntar(valores(entidade), new Object[]{entidade.getId(), entidade.getTenantId()});
        executar(sql, params);
    }

    /** DELETE lógico: o registro continua no banco para manter o histórico (RNF10). */
    public final void desativar(Long id, String tenantId) {
        executar("UPDATE " + tabela() + " SET ativo = FALSE WHERE id = ? AND tenant_id = ?", id, tenantId);
    }

    // =========================================================
    //  Utilitários reaproveitados pelos DAOs concretos
    // =========================================================

    /** SELECT com filtro extra, sempre restrito ao cliente e a registros ativos. */
    protected final List<T> buscarOnde(String tenantId, String condicao, Object... params) {
        String sql = selectBase() + " WHERE t.tenant_id = ? AND t.ativo = TRUE"
                + (condicao == null ? "" : " AND (" + condicao + ")")
                + " ORDER BY " + ordenacao();
        return consultar(sql, juntar(new Object[]{tenantId}, params));
    }

    protected final List<T> consultar(String sql, Object... params) {
        logSql(sql, params);
        return jdbc.query(sql, (rs, n) -> mapear(rs), params);
    }

    protected final int executar(String sql, Object... params) {
        logSql(sql, params);
        return jdbc.update(sql, params);
    }

    protected String selectBase() {
        return "SELECT t.*" + colunasExtras() + " FROM " + tabela() + " t " + joins();
    }

    /** Preenche os campos comuns (id, tenant, ativo) e delega o resto ao DAO concreto. */
    private T mapear(ResultSet rs) throws SQLException {
        T entidade = criarObjeto(rs);
        entidade.setId(rs.getLong("id"));
        entidade.setTenantId(rs.getString("tenant_id"));
        entidade.setAtivo(rs.getBoolean("ativo"));
        return entidade;
    }

    private void logSql(String sql, Object[] params) {
        log.info("[SQL] {}  | valores = {}", sql, Arrays.toString(params));
    }

    private static String marcadores(int quantidade) {
        return String.join(", ", java.util.Collections.nCopies(quantidade, "?"));
    }

    private static Object[] juntar(Object[] a, Object[] b) {
        Object[] r = Arrays.copyOf(a, a.length + b.length);
        System.arraycopy(b, 0, r, a.length, b.length);
        return r;
    }

    // ----- conversões usadas por vários DAOs -----

    /** Lista ["Cabo USB", "Protoboard"] -> texto com um item por linha (coluna TEXT). */
    protected static String emLinhas(List<String> itens) {
        return itens == null ? null : String.join("\n", itens);
    }

    protected static List<String> deLinhas(String texto) {
        if (texto == null || texto.isBlank()) return new ArrayList<>();
        return Arrays.stream(texto.split("\n")).map(String::trim).filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(ArrayList::new));
    }

    protected static Long longOuNulo(ResultSet rs, String coluna) throws SQLException {
        long v = rs.getLong(coluna);
        return rs.wasNull() ? null : v;
    }

    protected static String nomeEnum(Enum<?> e) {
        return e == null ? null : e.name();
    }
}
