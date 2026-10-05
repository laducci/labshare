/*
 * ============================================================
 *  EntidadeBase.java  |  Camada: Model (classe-mãe abstrata)
 *  Responsável na apresentação: Todos  |  Atividade: Q3 (compactação/reuso), Q1 (classes principais)
 * ------------------------------------------------------------
 *  O que faz: Superclasse de todas as entidades com CRUD. Concentra os 3 atributos comuns:
 *  id, tenantId (multi-cliente) e ativo (exclusão lógica). Graças a ela o
 *  AbstractDao<T extends EntidadeBase> e o CrudService funcionam para qualquer entidade.
 *  Quem chama: todas as entidades (extends), AbstractDao, CrudService, CrudController.   Chama: nada.
 * ============================================================
 */
package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Classe-mãe de todas as entidades do LabShare.
 *
 * REUSO: todo cadastro tem id, cliente (tenant) e "ativo" (exclusão lógica).
 * Em vez de repetir esses 3 atributos em 10 classes, eles ficam aqui uma vez só.
 * É isso que permite o AbstractDao e o CrudService funcionarem para qualquer entidade.
 */
// "abstract": não existe uma "EntidadeBase" sozinha; só suas filhas (Equipamento, Reserva...).
public abstract class EntidadeBase {

    // "protected": as subclasses enxergam diretamente esses campos.
    // tenantId = qual cliente é dono do registro (toda query filtra por tenant_id).
    // ativo = false significa "excluído" (exclusão lógica: UPDATE ... SET ativo = FALSE).
    protected Long id;
    protected String tenantId;
    protected boolean ativo = true;

    /** Exclusão lógica: o registro continua no banco (rastreabilidade), só some das listas. */
    public void desativar() {
        this.ativo = false;
    }

    // isNova(): true quando ainda não tem id (ainda não foi inserida no banco).
    // @JsonIgnore: não aparece no JSON enviado ao frontend (é só auxiliar interno).
    @JsonIgnore
    public boolean isNova() {
        return id == null;
    }

    // Getters e setters: usados pelo Jackson para converter objeto <-> JSON (e pelos DAOs/RowMapper ao ler do banco).
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}
