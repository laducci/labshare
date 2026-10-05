/*
 * ============================================================
 *  Categoria.java  |  Camada: Model (entidade / tabela categoria)
 *  Responsável na apresentação: João  |  Atividade: Q2 (CRUD de Categorias), Q3 (reuso via EntidadeBase)
 * ------------------------------------------------------------
 *  O que faz: Entidade Categoria: agrupa equipamentos (Eletrônica, Informática...).
 *  Herda id, tenantId e ativo de EntidadeBase, por isso o CRUD inteiro sai
 *  quase de graça com AbstractDao + CrudService + CrudController + CrudPage.
 *  Quem chama: CategoriaDao, CategoriaService, CategoriaController.   Chama: EntidadeBase.
 * ============================================================
 */
package br.pucpr.labshare.model;

/** Agrupa equipamentos: Eletrônica, Informática, Áudio e Vídeo, Ferramentas... */
// "extends EntidadeBase": reaproveita id, tenantId (multi-cliente) e ativo (exclusão lógica).
public class Categoria extends EntidadeBase {

    private String nome;
    // Nome do ícone mostrado no frontend (CategoryIcon); padrão "cpu".
    private String icone = "cpu";

    // Getters e setters: usados pelo Jackson para converter objeto <-> JSON (e pelos DAOs/RowMapper ao ler do banco).
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getIcone() { return icone; }
    public void setIcone(String icone) { this.icone = icone; }
}
