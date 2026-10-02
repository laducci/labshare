package br.pucpr.labshare.model;

/** Um item conferido pelo técnico na retirada ou na devolução (ex.: "Cabo USB - OK"). */
public class ItemChecklist {

    private String item;
    private boolean ok = true;
    private String observacao;

    public ItemChecklist() {}

    public ItemChecklist(String item, boolean ok) {
        this.item = item;
        this.ok = ok;
    }

    public boolean temDefeito() {
        return !ok;
    }

    @Override
    public String toString() {
        return item + (ok ? " - OK" : " - COM DEFEITO" + (observacao != null && !observacao.isBlank() ? " (" + observacao + ")" : ""));
    }

    public String getItem() { return item; }
    public void setItem(String item) { this.item = item; }
    public boolean isOk() { return ok; }
    public void setOk(boolean ok) { this.ok = ok; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
