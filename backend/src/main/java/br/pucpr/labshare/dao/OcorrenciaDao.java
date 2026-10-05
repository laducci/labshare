/*
 * ============================================================
 *  OcorrenciaDao.java  |  Camada: DAO (acesso ao banco, tabela ocorrencia)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (ocorrências), Q1 (Template Method), Q3 (compactação)
 * ------------------------------------------------------------
 *  O que faz: acesso à tabela "ocorrencia" (registro de defeito/dano em um equipamento).
 *  Uma ocorrência é criada quando a inspeção da devolução encontra defeito (RN08)
 *  e leva o equipamento para Em manutenção (RN09).
 *  Quem chama: OcorrenciaService <- OcorrenciaController <- tela Occurrence (front);
 *              ProcessoDevolucao (checklist da devolução).
 *  Chama: AbstractDao -> JdbcTemplate -> PostgreSQL.
 * ============================================================
 */
package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Ocorrencia;
import br.pucpr.labshare.model.StatusOcorrencia;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

// @Repository: componente de acesso a dados; o Spring cria uma instância e injeta onde for pedido.
// Template Method: só define os passos específicos; o algoritmo do CRUD está no AbstractDao.
@Repository
public class OcorrenciaDao extends AbstractDao<Ocorrencia> {

    // Injeção pelo construtor: recebe o JdbcTemplate do Spring e repassa ao AbstractDao.
    public OcorrenciaDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    // Passo abstrato: nome da tabela.
    @Override
    protected String tabela() {
        return "ocorrencia";
    }

    // Passo abstrato: colunas gravadas no INSERT/UPDATE (reserva_id liga a ocorrência ao empréstimo).
    @Override
    protected List<String> colunas() {
        return List.of("equipamento_id", "reserva_id", "descricao", "prioridade", "status", "data_abertura");
    }

    // Passo abstrato: valores na MESMA ordem das colunas.
    @Override
    protected Object[] valores(Ocorrencia o) {
        return new Object[]{o.getEquipamentoId(), o.getReservaId(), o.getDescricao(), o.getPrioridade(),
                nomeEnum(o.getStatus()), o.getDataAbertura()};
    }

    // Gancho sobrescrito: JOIN com equipamento para mostrar nome e foto na lista.
    @Override
    protected String joins() {
        return "JOIN equipamento e ON e.id = t.equipamento_id";
    }

    @Override
    protected String colunasExtras() {
        return ", e.nome AS equipamento_nome, e.imagem_url AS equipamento_imagem";
    }

    // Gancho: mais recentes primeiro.
    @Override
    protected String ordenacao() {
        return "t.data_abertura DESC, t.id DESC";
    }

    // Passo abstrato: linha do banco -> objeto Ocorrencia.
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

    // Ocorrências ainda sem manutenção iniciada (fila do painel de manutenção).
    // SQL: ... WHERE t.tenant_id = ? AND t.ativo = TRUE AND (t.status = 'ABERTA')
    // 'ABERTA' é um valor fixo do sistema (não vem do usuário), por isso pode ir direto no SQL.
    public List<Ocorrencia> listarAbertas(String tenantId) {
        return buscarOnde(tenantId, "t.status = 'ABERTA'");
    }
}
