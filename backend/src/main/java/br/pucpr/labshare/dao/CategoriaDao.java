package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Categoria;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/** Template Method: só informa O QUE muda. O COMO (INSERT/UPDATE/SELECT) vem do AbstractDao. */
@Repository
public class CategoriaDao extends AbstractDao<Categoria> {

    public CategoriaDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    @Override
    protected String tabela() {
        return "categoria";
    }

    @Override
    protected List<String> colunas() {
        return List.of("nome", "icone");
    }

    @Override
    protected Object[] valores(Categoria c) {
        return new Object[]{c.getNome(), c.getIcone()};
    }

    @Override
    protected Categoria criarObjeto(ResultSet rs) throws SQLException {
        Categoria c = new Categoria();
        c.setNome(rs.getString("nome"));
        c.setIcone(rs.getString("icone"));
        return c;
    }

    @Override
    protected String ordenacao() {
        return "t.nome";
    }
}
