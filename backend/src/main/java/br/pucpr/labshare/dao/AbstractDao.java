/*
 * ============================================================
 *  AbstractDao.java  |  Camada: DAO (acesso ao banco com JdbcTemplate)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Template Method, exemplo 1 de 3), Q3 (compactação de código)
 * ------------------------------------------------------------
 *  O que faz: classe-mãe de quase todos os DAOs. Monta e executa sozinha o
 *  SELECT / INSERT / UPDATE / "DELETE lógico" de qualquer tabela, sempre filtrando
 *  por tenant_id (multi-cliente) e por ativo = TRUE (exclusão lógica).
 *  Cada DAO filho só informa tabela, colunas, valores e como ler a linha.
 *  Quem chama: os Services (via DAOs filhos: CategoriaDao, EquipamentoDao, ReservaDao...)
 *              e o CrudService genérico (listar, buscarPorId, inserir, atualizar, desativar).
 *  Chama: JdbcTemplate do Spring -> PostgreSQL (Neon).
 * ============================================================
 */
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
 * INSERT/UPDATE/SELECT escrito à mão (código duplicado); agora cada DAO só tem os 4 métodos curtos.
 *
 * Generics: "T extends EntidadeBase" = T pode ser qualquer entidade (Categoria, Reserva...)
 * desde que herde de EntidadeBase, que garante os campos comuns id, tenantId e ativo.
 *
 * Por que os "?" em todo SQL: o JdbcTemplate usa PreparedStatement e envia os valores
 * separados do comando. Assim um texto digitado pelo usuário nunca vira parte do SQL
 * (proteção contra SQL Injection) e o banco ainda reaproveita o plano da consulta.
 */
public abstract class AbstractDao<T extends EntidadeBase> {

    // Logger: imprime no console cada SQL executado (útil para mostrar na apresentação).
    // getClass() pega a classe filha real, então o log aparece como "EquipamentoDao", "ReservaDao"...
    protected final Logger log = LoggerFactory.getLogger(getClass());
    // JdbcTemplate: classe do Spring que abre a conexão, executa o SQL e fecha tudo sozinha.
    protected final JdbcTemplate jdbc;

    // Injeção de dependência pelo construtor: o Spring cria o JdbcTemplate (com os dados de
    // application.properties) e entrega aqui através do construtor do DAO filho (super(jdbc)).
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

    /** Ordem da listagem (ORDER BY). Padrão: pelo id; os filhos trocam para nome, data etc. */
    protected String ordenacao() {
        return "t.id";
    }

    // =========================================================
    //  MÉTODOS-TEMPLATE: o algoritmo fixo (final = não pode ser alterado)
    // =========================================================

    /** READ (lista): só registros ativos do cliente logado. */
    // Usado pelo GET /api/<recurso> do CrudController (ex.: lista de categorias, locais, equipamentos).
    public final List<T> listar(String tenantId) {
        return buscarOnde(tenantId, null);
    }

    /** READ (um registro). */
    // SQL: SELECT t.* ... WHERE t.id = ? AND t.tenant_id = ?
    // O "AND t.tenant_id = ?" impede que um cliente leia o registro de outro só trocando o id na URL.
    public final Optional<T> buscarPorId(Long id, String tenantId) {
        String sql = selectBase() + " WHERE t.id = ? AND t.tenant_id = ?";
        return consultar(sql, id, tenantId).stream().findFirst();
    }

    /** CREATE: monta o INSERT a partir das colunas e devolve a entidade com o id gerado. */
    // Passo a passo: (1) pega as colunas do filho, (2) monta o INSERT com um "?" por coluna,
    // (3) junta tenant_id + ativo + valores do filho, (4) executa e lê o id gerado.
    // "RETURNING id" é do PostgreSQL: devolve o id SERIAL criado pelo banco.
    public final T inserir(T entidade) {
        List<String> cols = colunas();
        String sql = "INSERT INTO " + tabela()
                + " (tenant_id, ativo, " + String.join(", ", cols) + ")"
                + " VALUES (?, ?, " + marcadores(cols.size()) + ") RETURNING id";

        Object[] params = juntar(new Object[]{entidade.getTenantId(), entidade.isAtivo()}, valores(entidade));
        logSql(sql, params);
        // queryForObject porque o INSERT ... RETURNING devolve um valor (o id) como se fosse um SELECT.
        Long id = jdbc.queryForObject(sql, Long.class, params);
        entidade.setId(id);
        return entidade;
    }

    /** UPDATE: atualiza todas as colunas editáveis. */
    // Gera: UPDATE tabela SET col1 = ?, col2 = ? ... WHERE id = ? AND tenant_id = ?
    // Os valores do SET vêm primeiro e o id/tenant por último, na mesma ordem dos "?".
    public final void atualizar(T entidade) {
        String sets = colunas().stream().map(c -> c + " = ?").collect(Collectors.joining(", "));
        String sql = "UPDATE " + tabela() + " SET " + sets + " WHERE id = ? AND tenant_id = ?";
        Object[] params = juntar(valores(entidade), new Object[]{entidade.getId(), entidade.getTenantId()});
        executar(sql, params);
    }

    /** DELETE lógico: o registro continua no banco para manter o histórico (RNF10). */
    // Em vez de "DELETE FROM", marca ativo = FALSE. Assim reservas antigas que apontam para
    // este registro continuam válidas (chave estrangeira) e o histórico não se perde (RN11).
    public final void desativar(Long id, String tenantId) {
        executar("UPDATE " + tabela() + " SET ativo = FALSE WHERE id = ? AND tenant_id = ?", id, tenantId);
    }

    // =========================================================
    //  Utilitários reaproveitados pelos DAOs concretos
    // =========================================================

    /** SELECT com filtro extra, sempre restrito ao cliente e a registros ativos. */
    // Base de todas as consultas de lista. Os filhos só passam a condição extra,
    // ex.: buscarOnde(tenantId, "t.usuario_id = ?", usuarioId).
    // "tenant_id = ?" = multi-cliente; "ativo = TRUE" = esconde os excluídos logicamente.
    // Os parâmetros "..." (varargs) completam os "?" da condição, na ordem.
    protected final List<T> buscarOnde(String tenantId, String condicao, Object... params) {
        String sql = selectBase() + " WHERE t.tenant_id = ? AND t.ativo = TRUE"
                + (condicao == null ? "" : " AND (" + condicao + ")")
                + " ORDER BY " + ordenacao();
        return consultar(sql, juntar(new Object[]{tenantId}, params));
    }

    // Executa um SELECT e converte cada linha em objeto usando mapear() (RowMapper em forma de lambda).
    protected final List<T> consultar(String sql, Object... params) {
        logSql(sql, params);
        return jdbc.query(sql, (rs, n) -> mapear(rs), params);
    }

    // Executa INSERT/UPDATE sem retorno de linhas; devolve quantas linhas foram afetadas.
    protected final int executar(String sql, Object... params) {
        logSql(sql, params);
        return jdbc.update(sql, params);
    }

    // Início comum de todo SELECT: "t" é o apelido da tabela principal; joins e colunas extras vêm dos ganchos.
    // Ex. (EquipamentoDao): SELECT t.*, c.nome AS categoria_nome ... FROM equipamento t LEFT JOIN categoria c ...
    protected String selectBase() {
        return "SELECT t.*" + colunasExtras() + " FROM " + tabela() + " t " + joins();
    }

    /** Preenche os campos comuns (id, tenant, ativo) e delega o resto ao DAO concreto. */
    // Aqui o Template Method aparece de novo: o passo comum fica no pai, o específico (criarObjeto) no filho.
    private T mapear(ResultSet rs) throws SQLException {
        T entidade = criarObjeto(rs);
        entidade.setId(rs.getLong("id"));
        entidade.setTenantId(rs.getString("tenant_id"));
        entidade.setAtivo(rs.getBoolean("ativo"));
        return entidade;
    }

    // Mostra no console o SQL e os valores dos "?" (é o "[SQL] ..." que aparece no log do backend).
    private void logSql(String sql, Object[] params) {
        log.info("[SQL] {}  | valores = {}", sql, Arrays.toString(params));
    }

    // Gera "?, ?, ?" com a quantidade de colunas do INSERT.
    private static String marcadores(int quantidade) {
        return String.join(", ", java.util.Collections.nCopies(quantidade, "?"));
    }

    // Concatena dois arrays de parâmetros (ex.: [tenant, ativo] + [nome, descricao...]).
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

    // Caminho inverso de emLinhas: texto do banco -> lista, ignorando linhas vazias.
    protected static List<String> deLinhas(String texto) {
        if (texto == null || texto.isBlank()) return new ArrayList<>();
        return Arrays.stream(texto.split("\n")).map(String::trim).filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(ArrayList::new));
    }

    // Lê uma coluna numérica que pode ser NULL. rs.getLong devolve 0 para NULL,
    // por isso wasNull() confere e devolve null de verdade (ex.: equipamento sem local).
    protected static Long longOuNulo(ResultSet rs, String coluna) throws SQLException {
        long v = rs.getLong(coluna);
        return rs.wasNull() ? null : v;
    }

    // Converte um enum (ex.: StatusEquipamento.DISPONIVEL) no texto gravado no banco ("DISPONIVEL").
    protected static String nomeEnum(Enum<?> e) {
        return e == null ? null : e.name();
    }
}
