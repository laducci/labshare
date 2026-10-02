package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.CentroCusto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class CentroCustoDao extends AbstractDao<CentroCusto> {

    public CentroCustoDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    @Override
    protected String tabela() {
        return "centro_custo";
    }

    @Override
    protected List<String> colunas() {
        return List.of("codigo", "nome");
    }

    @Override
    protected Object[] valores(CentroCusto c) {
        return new Object[]{c.getCodigo(), c.getNome()};
    }

    @Override
    protected CentroCusto criarObjeto(ResultSet rs) throws SQLException {
        CentroCusto c = new CentroCusto();
        c.setCodigo(rs.getString("codigo"));
        c.setNome(rs.getString("nome"));
        return c;
    }

    @Override
    protected String ordenacao() {
        return "t.nome";
    }
}
