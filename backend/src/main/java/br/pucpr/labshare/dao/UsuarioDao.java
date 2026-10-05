/*
 * ============================================================
 *  UsuarioDao.java  |  Camada: DAO (acesso ao banco, tabela usuario)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (CRUD de Usuários + login), Q1 (Template Method), Q3 (compactação)
 * ------------------------------------------------------------
 *  O que faz: acesso à tabela "usuario". O CRUD vem do AbstractDao; aqui ficam as
 *  colunas, a leitura da linha, a busca por e-mail (login) e a busca por perfil
 *  (ex.: achar os gestores para avisar de uma reserva pendente).
 *  A senha nunca é gravada em texto puro: só o hash BCrypt (RNF04).
 *  Quem chama: UsuarioService, AuthService (login) <- UsuarioController / AuthController;
 *              AvisoReservaPendente e AvisoManutencaoConcluida (notificações).
 *  Chama: AbstractDao -> JdbcTemplate -> PostgreSQL.
 * ============================================================
 */
package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Perfil;
import br.pucpr.labshare.model.Usuario;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

// @Repository: componente de acesso a dados; o Spring cria uma instância e injeta onde for pedido.
// Template Method: só define os passos específicos; o algoritmo do CRUD está no AbstractDao.
@Repository
public class UsuarioDao extends AbstractDao<Usuario> {

    // Injeção pelo construtor: recebe o JdbcTemplate do Spring e repassa ao AbstractDao.
    public UsuarioDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    // Passo abstrato: nome da tabela.
    @Override
    protected String tabela() {
        return "usuario";
    }

    // Passo abstrato: colunas gravadas. "senha_hash" guarda o hash BCrypt, nunca a senha (RNF04).
    @Override
    protected List<String> colunas() {
        return List.of("nome", "email", "senha_hash", "perfil");
    }

    // Passo abstrato: valores na MESMA ordem das colunas. O perfil é gravado pelo rótulo
    // (ex.: "aluno", "tecnico"), que é o texto usado no banco e no frontend.
    @Override
    protected Object[] valores(Usuario u) {
        return new Object[]{u.getNome(), u.getEmail(), u.getSenhaHash(), u.getPerfil().getRotulo()};
    }

    // Passo abstrato: linha do banco -> objeto Usuario. Perfil.de converte o rótulo de volta no enum.
    @Override
    protected Usuario criarObjeto(ResultSet rs) throws SQLException {
        Usuario u = new Usuario();
        u.setNome(rs.getString("nome"));
        u.setEmail(rs.getString("email"));
        u.setSenhaHash(rs.getString("senha_hash"));
        u.setPerfil(Perfil.de(rs.getString("perfil")));
        return u;
    }

    // Gancho sobrescrito: ordem alfabética pelo nome.
    @Override
    protected String ordenacao() {
        return "t.nome";
    }

    /** Login: o e-mail é único no sistema inteiro, por isso não filtra por cliente. */
    // Tela Login -> POST /api/auth/login -> AuthService -> aqui. O AuthService depois compara a senha com o hash.
    // LOWER dos dois lados: "Lucas@Email.com" e "lucas@email.com" são o mesmo login.
    // "ativo = TRUE": usuário excluído (exclusão lógica) não consegue mais entrar.
    public Optional<Usuario> buscarPorEmail(String email) {
        String sql = selectBase() + " WHERE LOWER(t.email) = LOWER(?) AND t.ativo = TRUE";
        return consultar(sql, email).stream().findFirst();
    }

    // Usuários do cliente com um perfil (ex.: GESTOR para aprovar reservas, TECNICO/ADMIN para avisos de manutenção).
    // SQL: ... WHERE t.tenant_id = ? AND t.ativo = TRUE AND (t.perfil = ?)
    public List<Usuario> listarPorPerfil(String tenantId, Perfil perfil) {
        return buscarOnde(tenantId, "t.perfil = ?", perfil.getRotulo());
    }
}
