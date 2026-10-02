package br.pucpr.labshare.model;

/** Onde o equipamento fica guardado: Lab. Eletrônica, Sala Maker, Almoxarifado... */
public class Local extends EntidadeBase {

    private String nome;
    private String descricao;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}
