/*
 * ============================================================
 *  NotificacaoDao.java  |  Camada: DAO (acesso ao banco, tabela notificacao)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Template Method do DAO; usado pelo NotificacaoTemplate), Q2
 * ------------------------------------------------------------
 *  O que faz: acesso à tabela "notificacao" (avisos que aparecem no sino da tela
 *  Notifications). Grava avisos como lembrete de devolução (RN12), reserva
 *  pendente de aprovação e manutenção concluída, e lista os avisos de um usuário.
 *  Quem chama: NotificacaoService e as subclasses de NotificacaoTemplate
 *              (LembreteDevolucao, AvisoReservaPendente, AvisoManutencaoConcluida).
 *  Chama: AbstractDao -> JdbcTemplate -> PostgreSQL.
 * ============================================================
 */
package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Notificacao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

// @Repository: componente de acesso a dados; o Spring cria uma instância e injeta onde for pedido.
// Template Method: só define os passos específicos; o algoritmo do CRUD está no AbstractDao.
@Repository
public class NotificacaoDao extends AbstractDao<Notificacao> {

    // Injeção pelo construtor: recebe o JdbcTemplate do Spring e repassa ao AbstractDao.
    public NotificacaoDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    // Passo abstrato: nome da tabela.
    @Override
    protected String tabela() {
        return "notificacao";
    }

    // Passo abstrato: colunas gravadas ("lida" muda quando o usuário abre o aviso).
    @Override
    protected List<String> colunas() {
        return List.of("usuario_id", "titulo", "mensagem", "lida", "data_criacao");
    }

    // Passo abstrato: valores na MESMA ordem das colunas.
    @Override
    protected Object[] valores(Notificacao n) {
        return new Object[]{n.getUsuarioId(), n.getTitulo(), n.getMensagem(), n.isLida(), n.getDataCriacao()};
    }

    // Gancho sobrescrito: avisos mais recentes no topo.
    @Override
    protected String ordenacao() {
        return "t.data_criacao DESC, t.id DESC";
    }

    // Passo abstrato: linha do banco -> objeto Notificacao.
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

    // Tela Notifications -> GET /api/notificacoes/minhas -> NotificacaoService.
    // SQL: ... WHERE t.tenant_id = ? AND t.ativo = TRUE AND (t.usuario_id = ?)
    public List<Notificacao> listarDoUsuario(String tenantId, Long usuarioId) {
        return buscarOnde(tenantId, "t.usuario_id = ?", usuarioId);
    }
}
