/*
 * ============================================================
 *  Reserva.java  |  Camada: Model (entidade / tabela reserva)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Reservas), Q1 (classe principal)
 * ------------------------------------------------------------
 *  O que faz: Reserva de um equipamento por um usuário num período. Depois da retirada
 *  ela também representa o empréstimo. Contém as regras de período (RN03),
 *  conflito de datas, atraso e as transições de status (RN04, aprovação, cancelamento).
 *  Quem chama: ReservaDao, ReservaService, ReservaController, ProcessoRetirada, ProcessoDevolucao,
 *  estratégias de variabilidade.   Chama: StatusReserva, RegraNegocioException.
 * ============================================================
 */
package br.pucpr.labshare.model;

import br.pucpr.labshare.exception.RegraNegocioException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.Set;

/**
 * Reserva de um equipamento por um usuário em um período.
 * Depois da retirada ela também representa o empréstimo (data_retirada / data_devolucao).
 */
// Herda id, tenantId e ativo de EntidadeBase (reuso).
public class Reserva extends EntidadeBase {

    /** Status que "ocupam" o equipamento no calendário. */
    // static final: constante compartilhada; EnumSet é um Set otimizado para enums.
    public static final Set<StatusReserva> STATUS_ATIVOS =
            EnumSet.of(StatusReserva.AGUARDANDO_APROVACAO, StatusReserva.AGENDADA, StatusReserva.EM_USO);

    private Long usuarioId;
    private String usuarioNome;        // JOIN (só leitura)
    private Long equipamentoId;
    private String equipamentoNome;    // JOIN (só leitura)
    private String equipamentoImagem;  // JOIN (só leitura)
    private String localNome;          // JOIN (só leitura)
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private StatusReserva status;
    // Centro de custo: só preenchido para clientes com o recurso costCenter (variabilidade).
    private Long centroCustoId;
    private String centroCustoNome;    // JOIN (só leitura)
    private String justificativa;
    private LocalDateTime dataRetirada;
    private LocalDate dataDevolucao;
    private String observacoes;

    // ---------- Regras de negócio ----------

    /** RN03: a reserva precisa ter data inicial e final, e o fim não pode ser antes do início. */
    // Chamado pelo ReservaService ao criar/editar (POST/PUT /api/reservas). O prazo máximo vem
    // do Singleton ConfiguracaoEmprestimo.getInstance().getPrazoMaximoDias().
    public void validarPeriodo(int prazoMaximoDias) {
        if (dataInicio == null || dataFim == null) {
            throw new RegraNegocioException("Informe a data inicial e a data final da reserva.");
        }
        if (dataFim.isBefore(dataInicio)) {
            throw new RegraNegocioException("A data final não pode ser anterior à data inicial.");
        }
        if (getQuantidadeDias() > prazoMaximoDias) {
            throw new RegraNegocioException("O prazo máximo de empréstimo é de " + prazoMaximoDias + " dias.");
        }
    }

    // Dias do período contando o primeiro e o último (+1). Vai no JSON como "quantidadeDias".
    public long getQuantidadeDias() {
        if (dataInicio == null || dataFim == null) return 0;
        return ChronoUnit.DAYS.between(dataInicio, dataFim) + 1;
    }

    /** Dois períodos se sobrepõem? Usado para evitar reserva em conflito. */
    // Usado pelo ReservaService: dois períodos se cruzam se um não termina antes do outro começar.
    public boolean conflitaCom(LocalDate inicio, LocalDate fim) {
        return !dataFim.isBefore(inicio) && !dataInicio.isAfter(fim);
    }

    // Usado pelo ProcessoDevolucao: dias entre a data final prevista e a entrega (nunca negativo).
    // O resultado alimenta a estratégia CalculoMulta (variabilidade lateFee).
    public long calcularDiasDeAtraso(LocalDate dataEntrega) {
        long dias = ChronoUnit.DAYS.between(dataFim, dataEntrega);
        return Math.max(dias, 0);
    }

    // Reserva ativa = está em STATUS_ATIVOS (ainda ocupa o equipamento).
    public boolean estaAtiva() {
        return STATUS_ATIVOS.contains(status);
    }

    // Gestor aprova na tela ApprovalDetail -> POST /api/reservas/{id}/aprovar (recurso approvalRequired).
    public void aprovar() {
        exigirStatus(StatusReserva.AGUARDANDO_APROVACAO, "aprovar");
        status = StatusReserva.AGENDADA;
    }

    // Gestor rejeita -> POST /api/reservas/{id}/rejeitar (DecisaoRequest com o motivo).
    public void rejeitar() {
        exigirStatus(StatusReserva.AGUARDANDO_APROVACAO, "rejeitar");
        status = StatusReserva.REJEITADA;
    }

    // Usuário cancela em ReservationDetail -> POST /api/reservas/{id}/cancelar. Só antes da retirada.
    public void cancelar() {
        if (status != StatusReserva.AGENDADA && status != StatusReserva.AGUARDANDO_APROVACAO) {
            throw new RegraNegocioException("Só é possível cancelar reservas que ainda não foram retiradas.");
        }
        status = StatusReserva.CANCELADA;
    }

    /** RN04: a retirada só pode acontecer para uma reserva válida (agendada). */
    // Chamado pelo ProcessoRetirada (POST /api/emprestimos/{id}/retirada): Agendada -> Em uso.
    public void iniciarEmprestimo() {
        exigirStatus(StatusReserva.AGENDADA, "registrar a retirada de");
        status = StatusReserva.EM_USO;
        dataRetirada = LocalDateTime.now();
    }

    // Chamado pelo ProcessoDevolucao (POST /api/emprestimos/{id}/devolucao): Em uso -> Finalizada.
    public void finalizar(LocalDate dataEntrega) {
        exigirStatus(StatusReserva.EM_USO, "registrar a devolução de");
        status = StatusReserva.FINALIZADA;
        dataDevolucao = dataEntrega;
    }

    // Auxiliar reutilizado pelas transições: se o status atual não é o esperado, lança RegraNegocioException.
    private void exigirStatus(StatusReserva esperado, String acao) {
        if (status != esperado) {
            throw new RegraNegocioException("Não é possível " + acao + " uma reserva com status \"" + status.getRotulo() + "\".");
        }
    }

    // ---------- Getters e setters ----------

    // Getters e setters: usados pelo Jackson para converter objeto <-> JSON (e pelos DAOs/RowMapper ao ler do banco).
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getUsuarioNome() { return usuarioNome; }
    public void setUsuarioNome(String usuarioNome) { this.usuarioNome = usuarioNome; }
    public Long getEquipamentoId() { return equipamentoId; }
    public void setEquipamentoId(Long equipamentoId) { this.equipamentoId = equipamentoId; }
    public String getEquipamentoNome() { return equipamentoNome; }
    public void setEquipamentoNome(String equipamentoNome) { this.equipamentoNome = equipamentoNome; }
    public String getEquipamentoImagem() { return equipamentoImagem; }
    public void setEquipamentoImagem(String equipamentoImagem) { this.equipamentoImagem = equipamentoImagem; }
    public String getLocalNome() { return localNome; }
    public void setLocalNome(String localNome) { this.localNome = localNome; }
    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
    public StatusReserva getStatus() { return status; }
    public void setStatus(StatusReserva status) { this.status = status; }
    public Long getCentroCustoId() { return centroCustoId; }
    public void setCentroCustoId(Long centroCustoId) { this.centroCustoId = centroCustoId; }
    public String getCentroCustoNome() { return centroCustoNome; }
    public void setCentroCustoNome(String centroCustoNome) { this.centroCustoNome = centroCustoNome; }
    public String getJustificativa() { return justificativa; }
    public void setJustificativa(String justificativa) { this.justificativa = justificativa; }
    public LocalDateTime getDataRetirada() { return dataRetirada; }
    public void setDataRetirada(LocalDateTime dataRetirada) { this.dataRetirada = dataRetirada; }
    public LocalDate getDataDevolucao() { return dataDevolucao; }
    public void setDataDevolucao(LocalDate dataDevolucao) { this.dataDevolucao = dataDevolucao; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
