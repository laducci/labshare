/*
 * ============================================================
 *  CentroCustoDao.java  |  Camada: DAO (acesso ao banco, tabela centro_custo)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (variabilidade: recurso costCenter), Q1 (Template Method)
 * ------------------------------------------------------------
 *  O que faz: acesso à tabela "centro_custo", usada só por clientes com o recurso
 *  "costCenter" ligado (ex.: Empresa Corporativa). Como os outros DAOs simples,
 *  só informa tabela/colunas/leitura; o SQL vem pronto do AbstractDao.
 *  Quem chama: CentroCustoService, SeletorDeRegras e CentroCustoObrigatorio (Strategy RegraCentroCusto).
 *  Chama: AbstractDao -> JdbcTemplate -> PostgreSQL.
 * ============================================================
 */
package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.CentroCusto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

// @Repository: componente de acesso a dados criado e injetado pelo Spring.
// Template Method: só define os passos que mudam; o algoritmo do CRUD está no AbstractDao.
@Repository
public class CentroCustoDao extends AbstractDao<CentroCusto> {

    // Injeção pelo construtor: recebe o JdbcTemplate do Spring e repassa ao AbstractDao.
    public CentroCustoDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    // Passo abstrato: nome da tabela.
    @Override
    protected String tabela() {
        return "centro_custo";
    }

    // Passo abstrato: colunas editáveis (ex.: codigo "CC-ENG", nome "Engenharia de Produto").
    @Override
    protected List<String> colunas() {
        return List.of("codigo", "nome");
    }

    // Passo abstrato: valores na mesma ordem das colunas.
    @Override
    protected Object[] valores(CentroCusto c) {
        return new Object[]{c.getCodigo(), c.getNome()};
    }

    // Passo abstrato: linha do banco -> objeto CentroCusto.
    @Override
    protected CentroCusto criarObjeto(ResultSet rs) throws SQLException {
        CentroCusto c = new CentroCusto();
        c.setCodigo(rs.getString("codigo"));
        c.setNome(rs.getString("nome"));
        return c;
    }

    // Gancho sobrescrito: ordem alfabética pelo nome.
    @Override
    protected String ordenacao() {
        return "t.nome";
    }
}
