package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Multa;
import br.pucpr.labshare.model.StatusMulta;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class MultaDao extends AbstractDao<Multa> {

    public MultaDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    @Override
    protected String tabela() {
        return "multa";
    }

    @Override
    protected List<String> colunas() {
        return List.of("reserva_id", "dias_atraso", "valor", "status");
    }

    @Override
    protected Object[] valores(Multa m) {
        return new Object[]{m.getReservaId(), m.getDiasAtraso(), m.getValor(), nomeEnum(m.getStatus())};
    }

    @Override
    protected String joins() {
        return "JOIN reserva r ON r.id = t.reserva_id "
             + "JOIN usuario u ON u.id = r.usuario_id "
             + "JOIN equipamento e ON e.id = r.equipamento_id";
    }

    @Override
    protected String colunasExtras() {
        return ", u.nome AS usuario_nome, e.nome AS equipamento_nome";
    }

    @Override
    protected String ordenacao() {
        return "t.id DESC";
    }

    @Override
    protected Multa criarObjeto(ResultSet rs) throws SQLException {
        Multa m = new Multa();
        m.setReservaId(rs.getLong("reserva_id"));
        m.setUsuarioNome(rs.getString("usuario_nome"));
        m.setEquipamentoNome(rs.getString("equipamento_nome"));
        m.setDiasAtraso(rs.getInt("dias_atraso"));
        m.setValor(rs.getBigDecimal("valor"));
        m.setStatus(StatusMulta.valueOf(rs.getString("status")));
        return m;
    }
}
