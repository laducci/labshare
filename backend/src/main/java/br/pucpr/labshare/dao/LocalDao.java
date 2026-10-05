/*
 * ============================================================
 *  LocalDao.java  |  Camada: DAO (acesso ao banco, tabela local)
 *  Responsável na apresentação: João  |  Atividade: Q2 (CRUD de Locais), Q1 (Template Method), Q3 (compactação)
 * ------------------------------------------------------------
 *  O que faz: acesso à tabela "local" (laboratórios/salas onde ficam os equipamentos).
 *  Só informa tabela, colunas (nome, descricao) e como ler a linha; o SQL do
 *  CRUD vem pronto do AbstractDao.
 *  Quem chama: LocalService (via CrudService) <- LocalController <- tela CrudPage (front).
 *  Chama: AbstractDao -> JdbcTemplate -> PostgreSQL.
 * ============================================================
 */
package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Local;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

// @Repository: componente de acesso a dados; o Spring cria uma instância e a injeta no LocalService.
// Template Method: este DAO só preenche os passos abstratos do AbstractDao.
@Repository
public class LocalDao extends AbstractDao<Local> {

    // Injeção pelo construtor: recebe o JdbcTemplate e repassa ao AbstractDao.
    public LocalDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    // Passo abstrato: nome da tabela.
    @Override
    protected String tabela() {
        return "local";
    }

    // Passo abstrato: colunas editáveis.
    @Override
    protected List<String> colunas() {
        return List.of("nome", "descricao");
    }

    // Passo abstrato: valores na mesma ordem das colunas (preenchem os "?").
    @Override
    protected Object[] valores(Local l) {
        return new Object[]{l.getNome(), l.getDescricao()};
    }

    // Passo abstrato: linha do banco -> objeto Local.
    @Override
    protected Local criarObjeto(ResultSet rs) throws SQLException {
        Local l = new Local();
        l.setNome(rs.getString("nome"));
        l.setDescricao(rs.getString("descricao"));
        return l;
    }

    // Gancho sobrescrito: ordem alfabética pelo nome.
    @Override
    protected String ordenacao() {
        return "t.nome";
    }
}
