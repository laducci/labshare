/*
 * ============================================================
 *  Local.java  |  Camada: Model (entidade / tabela local)
 *  Responsável na apresentação: João  |  Atividade: Q2 (CRUD de Locais), Q3 (reuso via EntidadeBase)
 * ------------------------------------------------------------
 *  O que faz: Entidade Local: onde o equipamento fica guardado (Lab. Eletrônica, Sala Maker...).
 *  Como Categoria, herda de EntidadeBase e usa o CRUD genérico
 *  (AbstractDao + CrudService + CrudController + CrudPage).
 *  Quem chama: LocalDao, LocalService, LocalController.   Chama: EntidadeBase.
 * ============================================================
 */
package br.pucpr.labshare.model;

/** Onde o equipamento fica guardado: Lab. Eletrônica, Sala Maker, Almoxarifado... */
// "extends EntidadeBase": reaproveita id, tenantId e ativo.
public class Local extends EntidadeBase {

    private String nome;
    private String descricao;

    // Getters e setters: usados pelo Jackson para converter objeto <-> JSON (e pelos DAOs/RowMapper ao ler do banco).
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}
