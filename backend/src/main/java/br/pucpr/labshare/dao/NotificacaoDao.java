package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Notificacao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class NotificacaoDao extends AbstractDao<Notificacao> {

    public NotificacaoDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    @Override
    protected String tabela() {
        return "notificacao";
    }

    @Override
    protected List<String> colunas() {
        return List.of("usuario_id", "titulo", "mensagem", "lida", "data_criacao");
    }

    @Override
    protected Object[] valores(Notificacao n) {
        return new Object[]{n.getUsuarioId(), n.getTitulo(), n.getMensagem(), n.isLida(), n.getDataCriacao()};
    }

    @Override
    protected String ordenacao() {
        return "t.data_criacao DESC, t.id DESC";
    }

    @Override
    protected Notificacao criarObjeto(ResultSet rs) throws SQLException {
        Notificacao n = new Notificacao();
        n.setUsuarioId(rs.getLong("usuario_id"));
        n.setTitulo(rs.getString("titulo"));
        n.setMensagem(rs.getString("mensagem"));
        n.setLida(rs.getBoolean("lida"));
        n.setDataCriacao(rs.getObject("data_criacao", LocalDateTime.class));
        return n;
    }

    public List<Notificacao> listarDoUsuario(String tenantId, Long usuarioId) {
        return buscarOnde(tenantId, "t.usuario_id = ?", usuarioId);
    }
}
