package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Reserva;
import br.pucpr.labshare.model.StatusReserva;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Repository
public class ReservaDao extends AbstractDao<Reserva> {

    public ReservaDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    @Override
    protected String tabela() {
        return "reserva";
    }

    @Override
    protected List<String> colunas() {
        return List.of("usuario_id", "equipamento_id", "data_inicio", "data_fim", "status",
                "centro_custo_id", "justificativa", "data_retirada", "data_devolucao", "observacoes");
    }

    @Override
    protected Object[] valores(Reserva r) {
        return new Object[]{r.getUsuarioId(), r.getEquipamentoId(), r.getDataInicio(), r.getDataFim(),
                nomeEnum(r.getStatus()), r.getCentroCustoId(), r.getJustificativa(),
                r.getDataRetirada(), r.getDataDevolucao(), r.getObservacoes()};
    }

    @Override
    protected String joins() {
        return "JOIN usuario u ON u.id = t.usuario_id "
             + "JOIN equipamento e ON e.id = t.equipamento_id "
             + "LEFT JOIN local l ON l.id = e.local_id "
             + "LEFT JOIN centro_custo cc ON cc.id = t.centro_custo_id";
    }

    @Override
    protected String colunasExtras() {
        return ", u.nome AS usuario_nome, e.nome AS equipamento_nome, e.imagem_url AS equipamento_imagem,"
             + " l.nome AS local_nome, cc.nome AS centro_custo_nome";
    }

    @Override
    protected String ordenacao() {
        return "t.data_inicio DESC, t.id DESC";
    }

    @Override
    protected Reserva criarObjeto(ResultSet rs) throws SQLException {
        Reserva r = new Reserva();
        r.setUsuarioId(rs.getLong("usuario_id"));
        r.setUsuarioNome(rs.getString("usuario_nome"));
        r.setEquipamentoId(rs.getLong("equipamento_id"));
        r.setEquipamentoNome(rs.getString("equipamento_nome"));
        r.setEquipamentoImagem(rs.getString("equipamento_imagem"));
        r.setLocalNome(rs.getString("local_nome"));
        r.setDataInicio(rs.getObject("data_inicio", LocalDate.class));
        r.setDataFim(rs.getObject("data_fim", LocalDate.class));
        r.setStatus(StatusReserva.valueOf(rs.getString("status")));
        r.setCentroCustoId(longOuNulo(rs, "centro_custo_id"));
        r.setCentroCustoNome(rs.getString("centro_custo_nome"));
        r.setJustificativa(rs.getString("justificativa"));
        r.setDataRetirada(rs.getObject("data_retirada", LocalDateTime.class));
        r.setDataDevolucao(rs.getObject("data_devolucao", LocalDate.class));
        r.setObservacoes(rs.getString("observacoes"));
        return r;
    }

    public List<Reserva> listarDoUsuario(String tenantId, Long usuarioId) {
        return buscarOnde(tenantId, "t.usuario_id = ?", usuarioId);
    }

    public List<Reserva> listarPorStatus(String tenantId, StatusReserva... status) {
        String marcadores = String.join(", ", Collections.nCopies(status.length, "?"));
        Object[] nomes = Arrays.stream(status).map(Enum::name).toArray();
        return buscarOnde(tenantId, "t.status IN (" + marcadores + ")", nomes);
    }

    /** Reservas que ocupam o equipamento (para checar conflito e montar a disponibilidade). */
    public List<Reserva> listarAtivasDoEquipamento(String tenantId, Long equipamentoId) {
        return buscarOnde(tenantId, "t.equipamento_id = ? AND t.status IN ('AGUARDANDO_APROVACAO', 'AGENDADA', 'EM_USO')",
                equipamentoId);
    }
}
