/*
 * ============================================================
 *  ItemChecklist.java  |  Camada: Model (objeto de valor do checklist)
 *  Responsável na apresentação: Laura  |  Atividade: Q1 (Template Method ProcessoChecklist), Q3 (Checklist reutilizado)
 * ------------------------------------------------------------
 *  O que faz: Um item conferido pelo técnico (ex.: "Cabo USB" - OK ou COM DEFEITO).
 *  O mesmo objeto serve para a retirada (RN05) e para a devolução (RN07): é
 *  reutilizado pelas duas subclasses do Template Method e pela tela Checklist.
 *  Quem chama: ChecklistRequest, ProcessoRetirada, ProcessoDevolucao.   Chama: nada.
 * ============================================================
 */
package br.pucpr.labshare.model;

/** Um item conferido pelo técnico na retirada ou na devolução (ex.: "Cabo USB - OK"). */
// Não é tabela própria: os itens viram texto nas observações da reserva/ocorrência.
public class ItemChecklist {

    private String item;
    // Por padrão o item está OK; o técnico desmarca quando encontra defeito.
    private boolean ok = true;
    private String observacao;

    // Construtor vazio: exigido pelo Jackson para criar o objeto a partir do JSON.
    public ItemChecklist() {}

    public ItemChecklist(String item, boolean ok) {
        this.item = item;
        this.ok = ok;
    }

    // Usado pelo ProcessoDevolucao: se algum item tem defeito, gera ocorrência (RN08).
    public boolean temDefeito() {
        return !ok;
    }

    // toString(): texto legível do item, gravado nas observações (ex.: "Cabo USB - COM DEFEITO (rasgado)").
    @Override
    public String toString() {
        return item + (ok ? " - OK" : " - COM DEFEITO" + (observacao != null && !observacao.isBlank() ? " (" + observacao + ")" : ""));
    }

    // Getters e setters: usados pelo Jackson para converter objeto <-> JSON (e pelos DAOs/RowMapper ao ler do banco).
    public String getItem() { return item; }
    public void setItem(String item) { this.item = item; }
    public boolean isOk() { return ok; }
    public void setOk(boolean ok) { this.ok = ok; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
