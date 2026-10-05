/*
 * ============================================================
 *  ChecklistRequest.java  |  Camada: DTO (dados que chegam da tela)
 *  Responsável na apresentação: Laura  |  Atividade: Q1 (Template Method ProcessoChecklist), Q2 (retirada/devolução)
 * ------------------------------------------------------------
 *  O que faz: DTO = Data Transfer Object: só transporta dados, não é tabela. Representa o
 *  corpo JSON enviado pelas telas RegisterPickup e RegisterReturn: os itens do
 *  checklist conferidos pelo técnico, observações, prioridade e data de devolução.
 *  Quem chama: EmprestimoController (@RequestBody) -> ProcessoRetirada/ProcessoDevolucao.   Chama: ItemChecklist.
 * ============================================================
 */
package br.pucpr.labshare.dto;

import br.pucpr.labshare.model.ItemChecklist;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** Corpo do POST de retirada/devolução: o checklist conferido pelo técnico. */
public class ChecklistRequest {

    // Itens conferidos (ex.: "Cabo USB" ok/defeito). RN05: a retirada exige checklist;
    // RN07: a devolução exige inspeção. Começa como lista vazia para nunca ser null.
    private List<ItemChecklist> itens = new ArrayList<>();
    private String observacoes;
    private String prioridade = "Média";      // usada se a devolução gerar ocorrência
    private LocalDate dataDevolucao;          // opcional: padrão = hoje

    // Getters e setters: usados pelo Jackson para converter o JSON do corpo da requisição em objeto (e vice-versa).
    public List<ItemChecklist> getItens() { return itens; }
    // Se o JSON vier sem "itens" (null), troca por lista vazia para evitar NullPointerException.
    public void setItens(List<ItemChecklist> itens) { this.itens = itens == null ? new ArrayList<>() : itens; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public String getPrioridade() { return prioridade; }
    public void setPrioridade(String prioridade) { this.prioridade = prioridade; }
    public LocalDate getDataDevolucao() { return dataDevolucao; }
    public void setDataDevolucao(LocalDate dataDevolucao) { this.dataDevolucao = dataDevolucao; }
}
