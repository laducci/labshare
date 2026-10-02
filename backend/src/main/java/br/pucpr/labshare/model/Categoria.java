package br.pucpr.labshare.model;

/** Agrupa equipamentos: Eletrônica, Informática, Áudio e Vídeo, Ferramentas... */
public class Categoria extends EntidadeBase {

    private String nome;
    private String icone = "cpu";

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getIcone() { return icone; }
    public void setIcone(String icone) { this.icone = icone; }
}
