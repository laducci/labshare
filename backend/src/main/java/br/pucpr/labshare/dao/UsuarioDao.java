package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Perfil;
import br.pucpr.labshare.model.Usuario;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class UsuarioDao extends AbstractDao<Usuario> {

    public UsuarioDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    @Override
    protected String tabela() {
        return "usuario";
    }

    @Override
    protected List<String> colunas() {
        return List.of("nome", "email", "senha_hash", "perfil");
    }

    @Override
    protected Object[] valores(Usuario u) {
        return new Object[]{u.getNome(), u.getEmail(), u.getSenhaHash(), u.getPerfil().getRotulo()};
    }

    @Override
    protected Usuario criarObjeto(ResultSet rs) throws SQLException {
        Usuario u = new Usuario();
        u.setNome(rs.getString("nome"));
        u.setEmail(rs.getString("email"));
        u.setSenhaHash(rs.getString("senha_hash"));
        u.setPerfil(Perfil.de(rs.getString("perfil")));
        return u;
    }

    @Override
    protected String ordenacao() {
        return "t.nome";
    }

    /** Login: o e-mail é único no sistema inteiro, por isso não filtra por cliente. */
    public Optional<Usuario> buscarPorEmail(String email) {
        String sql = selectBase() + " WHERE LOWER(t.email) = LOWER(?) AND t.ativo = TRUE";
        return consultar(sql, email).stream().findFirst();
    }

    public List<Usuario> listarPorPerfil(String tenantId, Perfil perfil) {
        return buscarOnde(tenantId, "t.perfil = ?", perfil.getRotulo());
    }
}
