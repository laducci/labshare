package br.pucpr.labshare.model;

import java.time.LocalDate;

/** Defeito/problema registrado em um equipamento (RN08: defeito gera ocorrência). */
public class Ocorrencia extends EntidadeBase {

    private Long equipamentoId;
    private String equipamentoNome;    // JOIN (só leitura)
    private String equipamentoImagem;  // JOIN (só leitura)
    private Long reservaId;
    private String descricao;
    private String prioridade = "Média";
    private StatusOcorrencia status = StatusOcorrencia.ABERTA;
    private LocalDate dataAbertura = LocalDate.now();

    public boolean estaAberta() {
        return status != StatusOcorrencia.ENCERRADA;
    }

    public void iniciarAtendimento() {
        status = StatusOcorrencia.EM_MANUTENCAO;
    }

    public void encerrar() {
        status = StatusOcorrencia.ENCERRADA;
    }

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
