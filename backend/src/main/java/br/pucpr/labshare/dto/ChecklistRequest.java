package br.pucpr.labshare.dto;

import br.pucpr.labshare.model.ItemChecklist;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** Corpo do POST de retirada/devolução: o checklist conferido pelo técnico. */
public class ChecklistRequest {

    private List<ItemChecklist> itens = new ArrayList<>();
    private String observacoes;
    private String prioridade = "Média";      // usada se a devolução gerar ocorrência
    private LocalDate dataDevolucao;          // opcional: padrão = hoje

    public List<ItemChecklist> getItens() { return itens; }
    public void setItens(List<ItemChecklist> itens) { this.itens = itens == null ? new ArrayList<>() : itens; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public String getPrioridade() { return prioridade; }
    public void setPrioridade(String prioridade) { this.prioridade = prioridade; }
    public LocalDate getDataDevolucao() { return dataDevolucao; }
    public void setDataDevolucao(LocalDate dataDevolucao) { this.dataDevolucao = dataDevolucao; }
}
