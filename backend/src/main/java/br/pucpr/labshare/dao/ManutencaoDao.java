package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Manutencao;
import br.pucpr.labshare.model.StatusManutencao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

@Repository
public class ManutencaoDao extends AbstractDao<Manutencao> {

    public ManutencaoDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    @Override
    protected String tabela() {
        return "manutencao";
    }

    @Override
    protected List<String> colunas() {
        return List.of("equipamento_id", "ocorrencia_id", "responsavel_id", "descricao_reparo",
                "pecas_substituidas", "data_inicio", "data_fim", "status");
    }

    @Override
    protected Object[] valores(Manutencao m) {
        return new Object[]{m.getEquipamentoId(), m.getOcorrenciaId(), m.getResponsavelId(), m.getDescricaoReparo(),
                m.getPecasSubstituidas(), m.getDataInicio(), m.getDataFim(), nomeEnum(m.getStatus())};
    }

    @Override
    protected String joins() {
        return "JOIN equipamento e ON e.id = t.equipamento_id "
             + "LEFT JOIN ocorrencia o ON o.id = t.ocorrencia_id "
             + "LEFT JOIN usuario u ON u.id = t.responsavel_id";
    }

    @Override
    protected String colunasExtras() {
        return ", e.nome AS equipamento_nome, e.imagem_url AS equipamento_imagem, e.patrimonio AS equipamento_patrimonio,"
             + " o.descricao AS ocorrencia_descricao, o.prioridade AS prioridade, u.nome AS responsavel_nome";
    }

    @Override
    protected String ordenacao() {
        return "t.data_inicio DESC, t.id DESC";
    }

    @Override
    protected Manutencao criarObjeto(ResultSet rs) throws SQLException {
        Manutencao m = new Manutencao();
        m.setEquipamentoId(rs.getLong("equipamento_id"));
        m.setEquipamentoNome(rs.getString("equipamento_nome"));
        m.setEquipamentoImagem(rs.getString("equipamento_imagem"));
        m.setEquipamentoPatrimonio(rs.getString("equipamento_patrimonio"));
        m.setOcorrenciaId(longOuNulo(rs, "ocorrencia_id"));
        m.setOcorrenciaDescricao(rs.getString("ocorrencia_descricao"));
        m.setPrioridade(rs.getString("prioridade"));
        m.setResponsavelId(longOuNulo(rs, "responsavel_id"));
        m.setResponsavelNome(rs.getString("responsavel_nome"));
        m.setDescricaoReparo(rs.getString("descricao_reparo"));
        m.setPecasSubstituidas(rs.getString("pecas_substituidas"));
        m.setDataInicio(rs.getObject("data_inicio", LocalDate.class));
        m.setDataFim(rs.getObject("data_fim", LocalDate.class));
        m.setStatus(StatusManutencao.valueOf(rs.getString("status")));
        return m;
    }
}
