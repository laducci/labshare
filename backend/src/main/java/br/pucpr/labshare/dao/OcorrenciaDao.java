package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Ocorrencia;
import br.pucpr.labshare.model.StatusOcorrencia;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

@Repository
public class OcorrenciaDao extends AbstractDao<Ocorrencia> {

    public OcorrenciaDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    @Override
    protected String tabela() {
        return "ocorrencia";
    }

    @Override
    protected List<String> colunas() {
        return List.of("equipamento_id", "reserva_id", "descricao", "prioridade", "status", "data_abertura");
    }

    @Override
    protected Object[] valores(Ocorrencia o) {
        return new Object[]{o.getEquipamentoId(), o.getReservaId(), o.getDescricao(), o.getPrioridade(),
                nomeEnum(o.getStatus()), o.getDataAbertura()};
    }

    @Override
    protected String joins() {
        return "JOIN equipamento e ON e.id = t.equipamento_id";
    }

    @Override
    protected String colunasExtras() {
        return ", e.nome AS equipamento_nome, e.imagem_url AS equipamento_imagem";
    }

    @Override
    protected String ordenacao() {
        return "t.data_abertura DESC, t.id DESC";
    }

    @Override
    protected Ocorrencia criarObjeto(ResultSet rs) throws SQLException {
        Ocorrencia o = new Ocorrencia();
        o.setEquipamentoId(rs.getLong("equipamento_id"));
        o.setEquipamentoNome(rs.getString("equipamento_nome"));
        o.setEquipamentoImagem(rs.getString("equipamento_imagem"));
        o.setReservaId(longOuNulo(rs, "reserva_id"));
        o.setDescricao(rs.getString("descricao"));
        o.setPrioridade(rs.getString("prioridade"));
        o.setStatus(StatusOcorrencia.valueOf(rs.getString("status")));
        o.setDataAbertura(rs.getObject("data_abertura", LocalDate.class));
        return o;
    }

    public List<Ocorrencia> listarAbertas(String tenantId) {
        return buscarOnde(tenantId, "t.status = 'ABERTA'");
    }
}
