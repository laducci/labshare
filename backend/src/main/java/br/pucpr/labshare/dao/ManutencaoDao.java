/*
 * ============================================================
 *  ManutencaoDao.java  |  Camada: DAO (acesso ao banco, tabela manutencao)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (CRUD de Manutenções), Q1 (Template Method), Q3 (compactação)
 * ------------------------------------------------------------
 *  O que faz: acesso à tabela "manutencao". O CRUD vem do AbstractDao; aqui ficam
 *  as colunas, os JOINs com equipamento, ocorrência e responsável, e a leitura da linha.
 *  Uma manutenção nasce de uma ocorrência (RN08/RN09) e, ao ser concluída, libera o
 *  equipamento de volta para Disponível (RN10).
 *  Quem chama: ManutencaoService <- ManutencaoController <- telas MaintenancePanel,
 *              EquipmentMaintenance, MaintenanceComplete (front).
 *  Chama: AbstractDao -> JdbcTemplate -> PostgreSQL.
 * ============================================================
 */
package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Manutencao;
import br.pucpr.labshare.model.StatusManutencao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

// @Repository: componente de acesso a dados; o Spring cria uma instância e injeta no ManutencaoService.
// Template Method: só define os passos específicos; o algoritmo do CRUD está no AbstractDao.
@Repository
public class ManutencaoDao extends AbstractDao<Manutencao> {

    // Injeção pelo construtor: recebe o JdbcTemplate do Spring e repassa ao AbstractDao.
    public ManutencaoDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    // Passo abstrato: nome da tabela.
    @Override
    protected String tabela() {
        return "manutencao";
    }

    // Passo abstrato: colunas gravadas no INSERT/UPDATE.
    @Override
    protected List<String> colunas() {
        return List.of("equipamento_id", "ocorrencia_id", "responsavel_id", "descricao_reparo",
                "pecas_substituidas", "data_inicio", "data_fim", "status", "fornecedor_cnpj");
    }

    // Passo abstrato: valores na MESMA ordem das colunas.
    @Override
    protected Object[] valores(Manutencao m) {
        return new Object[]{m.getEquipamentoId(), m.getOcorrenciaId(), m.getResponsavelId(), m.getDescricaoReparo(),
                m.getPecasSubstituidas(), m.getDataInicio(), m.getDataFim(), nomeEnum(m.getStatus()), m.getFornecedorCnpj()};
    }

    // Gancho sobrescrito: JOIN com equipamento (sempre existe) e LEFT JOIN com ocorrência
    // e responsável (podem estar vazios, ex.: manutenção preventiva sem ocorrência).
    @Override
    protected String joins() {
        return "JOIN equipamento e ON e.id = t.equipamento_id "
             + "LEFT JOIN ocorrencia o ON o.id = t.ocorrencia_id "
             + "LEFT JOIN usuario u ON u.id = t.responsavel_id";
    }

    // Gancho: dados das tabelas relacionadas mostrados no painel de manutenção.
    @Override
    protected String colunasExtras() {
        return ", e.nome AS equipamento_nome, e.imagem_url AS equipamento_imagem, e.patrimonio AS equipamento_patrimonio,"
             + " o.descricao AS ocorrencia_descricao, o.prioridade AS prioridade, u.nome AS responsavel_nome";
    }

    // Gancho: mais recentes primeiro.
    @Override
    protected String ordenacao() {
        return "t.data_inicio DESC, t.id DESC";
    }

    // Passo abstrato: linha do banco -> objeto Manutencao.
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
        m.setFornecedorCnpj(rs.getString("fornecedor_cnpj"));
        m.setDataInicio(rs.getObject("data_inicio", LocalDate.class));
        m.setDataFim(rs.getObject("data_fim", LocalDate.class));
        m.setStatus(StatusManutencao.valueOf(rs.getString("status")));
        return m;
    }
}
