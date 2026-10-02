package br.pucpr.labshare.model;

import br.pucpr.labshare.exception.RegraNegocioException;

import java.time.LocalDate;

/** Reparo feito pela equipe de manutenção a partir de uma ocorrência. */
public class Manutencao extends EntidadeBase {

    private Long equipamentoId;
    private String equipamentoNome;       // JOIN (só leitura)
    private String equipamentoImagem;     // JOIN (só leitura)
    private String equipamentoPatrimonio; // JOIN (só leitura)
    private Long ocorrenciaId;
    private String ocorrenciaDescricao;   // JOIN (só leitura)
    private String prioridade;            // JOIN (só leitura)
    private Long responsavelId;
    private String responsavelNome;       // JOIN (só leitura)
    private String descricaoReparo;
    private String pecasSubstituidas;
    private LocalDate dataInicio = LocalDate.now();
    private LocalDate dataFim;
    private StatusManutencao status = StatusManutencao.EM_ANDAMENTO;

    public boolean estaConcluida() {
        return status == StatusManutencao.CONCLUIDA;
    }

    public void concluir() {
        if (estaConcluida()) {
            throw new RegraNegocioException("Esta manutenção já foi concluída.");
        }
        if (descricaoReparo == null || descricaoReparo.isBlank()) {
            throw new RegraNegocioException("Descreva o reparo realizado antes de concluir.");
        }
        status = StatusManutencao.CONCLUIDA;
        dataFim = LocalDate.now();
    }

    public Long getEquipamentoId() { return equipamentoId; }
    public void setEquipamentoId(Long equipamentoId) { this.equipamentoId = equipamentoId; }
    public String getEquipamentoNome() { return equipamentoNome; }
    public void setEquipamentoNome(String equipamentoNome) { this.equipamentoNome = equipamentoNome; }
    public String getEquipamentoImagem() { return equipamentoImagem; }
    public void setEquipamentoImagem(String equipamentoImagem) { this.equipamentoImagem = equipamentoImagem; }
    public String getEquipamentoPatrimonio() { return equipamentoPatrimonio; }
    public void setEquipamentoPatrimonio(String equipamentoPatrimonio) { this.equipamentoPatrimonio = equipamentoPatrimonio; }
    public Long getOcorrenciaId() { return ocorrenciaId; }
    public void setOcorrenciaId(Long ocorrenciaId) { this.ocorrenciaId = ocorrenciaId; }
    public String getOcorrenciaDescricao() { return ocorrenciaDescricao; }
    public void setOcorrenciaDescricao(String ocorrenciaDescricao) { this.ocorrenciaDescricao = ocorrenciaDescricao; }
    public String getPrioridade() { return prioridade; }
    public void setPrioridade(String prioridade) { this.prioridade = prioridade; }
    public Long getResponsavelId() { return responsavelId; }
    public void setResponsavelId(Long responsavelId) { this.responsavelId = responsavelId; }
    public String getResponsavelNome() { return responsavelNome; }
    public void setResponsavelNome(String responsavelNome) { this.responsavelNome = responsavelNome; }
    public String getDescricaoReparo() { return descricaoReparo; }
    public void setDescricaoReparo(String descricaoReparo) { this.descricaoReparo = descricaoReparo; }
    public String getPecasSubstituidas() { return pecasSubstituidas; }
    public void setPecasSubstituidas(String pecasSubstituidas) { this.pecasSubstituidas = pecasSubstituidas; }
    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
    public StatusManutencao getStatus() { return status; }
    public void setStatus(StatusManutencao status) { this.status = status; }
}
