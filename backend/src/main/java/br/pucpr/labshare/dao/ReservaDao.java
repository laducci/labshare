/*
 * ============================================================
 *  ReservaDao.java  |  Camada: DAO (acesso ao banco, tabela reserva)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Reservas), Q1 (Template Method), Q3 (compactação)
 * ------------------------------------------------------------
 *  O que faz: acesso à tabela "reserva". O CRUD vem do AbstractDao; aqui ficam as
 *  colunas, os JOINs (usuário, equipamento, local, centro de custo) e consultas
 *  próprias: reservas do usuário, por status e as que ocupam um equipamento
 *  (para checar conflito de datas e montar a tela de disponibilidade).
 *  Quem chama: ReservaService, EquipamentoService, NotificacaoService e os processos
 *              do checklist (ProcessoRetirada, ProcessoDevolucao) <- ReservaController / EmprestimoController.
 *  Chama: AbstractDao -> JdbcTemplate -> PostgreSQL.
 * ============================================================
 */
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

// @Repository: componente de acesso a dados; o Spring cria uma instância e injeta nos Services.
// Template Method: herda o algoritmo do CRUD do AbstractDao e só define os passos específicos.
@Repository
public class ReservaDao extends AbstractDao<Reserva> {

    // Injeção pelo construtor: recebe o JdbcTemplate do Spring e repassa ao AbstractDao.
    public ReservaDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    // Passo abstrato: nome da tabela.
    @Override
    protected String tabela() {
        return "reserva";
    }

    // Passo abstrato: colunas gravadas no INSERT/UPDATE.
    // data_inicio e data_fim são obrigatórias (RN03, validado no ReservaService);
    // data_retirada e data_devolucao são preenchidas no fluxo de retirada/devolução.
    @Override
    protected List<String> colunas() {
        return List.of("usuario_id", "equipamento_id", "data_inicio", "data_fim", "status",
                "centro_custo_id", "justificativa", "data_retirada", "data_devolucao", "observacoes");
    }

    // Passo abstrato: valores na MESMA ordem das colunas (o status vai como texto, ex.: "AGENDADA").
    @Override
    protected Object[] valores(Reserva r) {
        return new Object[]{r.getUsuarioId(), r.getEquipamentoId(), r.getDataInicio(), r.getDataFim(),
                nomeEnum(r.getStatus()), r.getCentroCustoId(), r.getJustificativa(),
                r.getDataRetirada(), r.getDataDevolucao(), r.getObservacoes()};
    }

    // Gancho sobrescrito: JOINs para mostrar nomes na tela em vez de só ids.
    // JOIN (obrigatório) para usuário e equipamento, que toda reserva tem;
    // LEFT JOIN para local e centro de custo, que podem não existir.
    @Override
    protected String joins() {
        return "JOIN usuario u ON u.id = t.usuario_id "
             + "JOIN equipamento e ON e.id = t.equipamento_id "
             + "LEFT JOIN local l ON l.id = e.local_id "
             + "LEFT JOIN centro_custo cc ON cc.id = t.centro_custo_id";
    }

    // Gancho: colunas vindas dos JOINs (nome do usuário, nome/foto do equipamento, local, centro de custo).
    @Override
    protected String colunasExtras() {
        return ", u.nome AS usuario_nome, e.nome AS equipamento_nome, e.imagem_url AS equipamento_imagem,"
             + " l.nome AS local_nome, cc.nome AS centro_custo_nome";
    }

    // Gancho: mais recentes primeiro.
    @Override
    protected String ordenacao() {
        return "t.data_inicio DESC, t.id DESC";
    }

    // Passo abstrato: linha do banco -> objeto Reserva.
    // rs.getObject(..., LocalDate.class) converte a coluna DATE/TIMESTAMP direto para as classes de data do Java.
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

    // Tela "Minhas reservas" -> GET /api/reservas/minhas -> ReservaService.
    // SQL: ... WHERE t.tenant_id = ? AND t.ativo = TRUE AND (t.usuario_id = ?)
    public List<Reserva> listarDoUsuario(String tenantId, Long usuarioId) {
        return buscarOnde(tenantId, "t.usuario_id = ?", usuarioId);
    }

    // Filtra por um ou mais status (ex.: painel do técnico pede AGENDADA e EM_USO).
    // Chamado por GET /api/reservas?status=... e pelo lembrete de devolução (NotificacaoService).
    // Gera um "?" para cada status: "t.status IN (?, ?)" e passa os nomes dos enums como valores.
    public List<Reserva> listarPorStatus(String tenantId, StatusReserva... status) {
        String marcadores = String.join(", ", Collections.nCopies(status.length, "?"));
        Object[] nomes = Arrays.stream(status).map(Enum::name).toArray();
        return buscarOnde(tenantId, "t.status IN (" + marcadores + ")", nomes);
    }

    /** Reservas que ocupam o equipamento (para checar conflito e montar a disponibilidade). */
    // Considera "ocupando" quem está aguardando aprovação, agendada ou em uso;
    // reservas finalizadas, canceladas ou rejeitadas não bloqueiam o equipamento.
    // Usado pelo ReservaService (conflito de datas ao criar reserva), pela tela Availability
    // (GET /api/equipamentos/{id}/ocupacao) e pelo EquipamentoService (não exclui equipamento com reserva ativa).
    public List<Reserva> listarAtivasDoEquipamento(String tenantId, Long equipamentoId) {
        return buscarOnde(tenantId, "t.equipamento_id = ? AND t.status IN ('AGUARDANDO_APROVACAO', 'AGENDADA', 'EM_USO')",
                equipamentoId);
    }
}
