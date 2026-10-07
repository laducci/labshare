/*
 * ============================================================
 *  CategoriaDao.java  |  Camada: DAO (acesso ao banco, tabela categoria)
 *  Responsável na apresentação: João  |  Atividade: Q2 (CRUD de Categorias), Q1 (Template Method), Q3 (compactação)
 * ------------------------------------------------------------
 *  O que faz: acesso à tabela "categoria". Não escreve nenhum SQL: só diz ao
 *  AbstractDao o nome da tabela, as colunas (nome, icone) e como ler uma linha.
 *  O INSERT/UPDATE/SELECT/exclusão lógica vêm prontos do AbstractDao.
 *  Quem chama: CategoriaService (via CrudService) <- CategoriaController <- tela CrudPage (front).
 *  Chama: AbstractDao -> JdbcTemplate -> PostgreSQL.
 * ============================================================
 */
package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Categoria;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/** Template Method: só informa O QUE muda. O COMO (INSERT/UPDATE/SELECT) vem do AbstractDao. */
// @Repository: marca a classe como componente de acesso a dados. O Spring cria UM objeto dela
// e o injeta em quem pedir (ex.: no construtor do CategoriaService).
@Repository
public class CategoriaDao extends AbstractDao<Categoria> {

    // Injeção pelo construtor: o Spring entrega o JdbcTemplate e repassamos ao AbstractDao.
    public CategoriaDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    // Passo abstrato 1: nome da tabela.
    @Override
    protected String tabela() {
        return "categoria";
    }

    // Passo abstrato 2: colunas editáveis (id, tenant_id e ativo o AbstractDao já trata).
    @Override
    protected List<String> colunas() {
        return List.of("nome", "icone", "grupo_patrimonial");
    }

    // Passo abstrato 3: valores na MESMA ordem das colunas acima (preenchem os "?").
    @Override
    protected Object[] valores(Categoria c) {
        return new Object[]{c.getNome(), c.getIcone(), c.getGrupoPatrimonial()};
    }

    // Passo abstrato 4: transforma uma linha do SELECT em objeto Categoria.
    @Override
    protected Categoria criarObjeto(ResultSet rs) throws SQLException {
        Categoria c = new Categoria();
        c.setNome(rs.getString("nome"));
        c.setIcone(rs.getString("icone"));
        c.setGrupoPatrimonial(rs.getString("grupo_patrimonial"));
        return c;
    }

    // Gancho sobrescrito: lista em ordem alfabética (ORDER BY t.nome).
    @Override
    protected String ordenacao() {
        return "t.nome";
    }
}
