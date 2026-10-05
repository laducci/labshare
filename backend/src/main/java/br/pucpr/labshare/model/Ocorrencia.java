/*
 * ============================================================
 *  Ocorrencia.java  |  Camada: Model (entidade / tabela ocorrencia)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (ocorrências), RN08 / RN09
 * ------------------------------------------------------------
 *  O que faz: Defeito ou problema registrado em um equipamento. Pode nascer da devolução
 *  com item com defeito (RN08) ou da tela Occurrence. Uma ocorrência aberta
 *  manda o equipamento para "Em manutenção" (RN09).
 *  Quem chama: ProcessoDevolucao, OcorrenciaDao, OcorrenciaService, ManutencaoService, OcorrenciaController.
 *  Chama: StatusOcorrencia.
 * ============================================================
 */
package br.pucpr.labshare.model;

import java.time.LocalDate;

/** Defeito/problema registrado em um equipamento (RN08: defeito gera ocorrência). */
// Herda id, tenantId e ativo de EntidadeBase.
public class Ocorrencia extends EntidadeBase {

    private Long equipamentoId;
    private String equipamentoNome;    // JOIN (só leitura)
    private String equipamentoImagem;  // JOIN (só leitura)
    private Long reservaId;
    private String descricao;
    // Prioridade e status padrão; a data de abertura é "hoje".
    private String prioridade = "Média";
    private StatusOcorrencia status = StatusOcorrencia.ABERTA;
    private LocalDate dataAbertura = LocalDate.now();

    // Aberta = ainda não encerrada (aguardando ou em manutenção).
    public boolean estaAberta() {
        return status != StatusOcorrencia.ENCERRADA;
    }

    // ManutencaoService: ao abrir uma manutenção para a ocorrência, ela passa a "Em manutenção".
    public void iniciarAtendimento() {
        status = StatusOcorrencia.EM_MANUTENCAO;
    }

    // ManutencaoService: ao concluir a manutenção, a ocorrência é encerrada.
    public void encerrar() {
        status = StatusOcorrencia.ENCERRADA;
    }

    // Getters e setters: usados pelo Jackson para converter objeto <-> JSON (e pelos DAOs/RowMapper ao ler do banco).
    public Long getEquipamentoId() { return equipamentoId; }
    public void setEquipamentoId(Long equipamentoId) { this.equipamentoId = equipamentoId; }
    public String getEquipamentoNome() { return equipamentoNome; }
    public void setEquipamentoNome(String equipamentoNome) { this.equipamentoNome = equipamentoNome; }
    public String getEquipamentoImagem() { return equipamentoImagem; }
    public void setEquipamentoImagem(String equipamentoImagem) { this.equipamentoImagem = equipamentoImagem; }
    public Long getReservaId() { return reservaId; }
    public void setReservaId(Long reservaId) { this.reservaId = reservaId; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getPrioridade() { return prioridade; }
    public void setPrioridade(String prioridade) { this.prioridade = prioridade; }
    public StatusOcorrencia getStatus() { return status; }
    public void setStatus(StatusOcorrencia status) { this.status = status; }
    public LocalDate getDataAbertura() { return dataAbertura; }
    public void setDataAbertura(LocalDate dataAbertura) { this.dataAbertura = dataAbertura; }
}
