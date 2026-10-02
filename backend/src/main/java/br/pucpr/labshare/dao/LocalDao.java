package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Local;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class LocalDao extends AbstractDao<Local> {

    public LocalDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    @Override
    protected String tabela() {
        return "local";
    }

    @Override
    protected List<String> colunas() {
        return List.of("nome", "descricao");
    }

    @Override
    protected Object[] valores(Local l) {
        return new Object[]{l.getNome(), l.getDescricao()};
    }

    @Override
    protected Local criarObjeto(ResultSet rs) throws SQLException {
        Local l = new Local();
        l.setNome(rs.getString("nome"));
        l.setDescricao(rs.getString("descricao"));
        return l;
    }

    @Override
    protected String ordenacao() {
        return "t.nome";
    }
}
