/*
 * ============================================================
 *  CentroCusto.java  |  Camada: Model (entidade / tabela centro_custo)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (variabilidade costCenter), Q1 (Strategy RegraCentroCusto)
 * ------------------------------------------------------------
 *  O que faz: Centro de custo da empresa (ex.: "TI-01 - Tecnologia"). Só é usado por
 *  clientes com o recurso "costCenter": nesses, a estratégia CentroCustoObrigatorio
 *  exige que toda reserva informe um centro de custo.
 *  Quem chama: CentroCustoDao, CentroCustoService, CentroCustoController, CentroCustoObrigatorio.
 *  Chama: EntidadeBase.
 * ============================================================
 */
package br.pucpr.labshare.model;

/** VARIABILIDADE: só existe para clientes com o recurso "costCenter" (Empresa Corporativa). */
// Herda id, tenantId e ativo: CRUD reaproveitado (AbstractDao/CrudService/CrudController).
public class CentroCusto extends EntidadeBase {

    private String codigo;
    private String nome;

    // Getters e setters: usados pelo Jackson para converter objeto <-> JSON (e pelos DAOs/RowMapper ao ler do banco).
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}
