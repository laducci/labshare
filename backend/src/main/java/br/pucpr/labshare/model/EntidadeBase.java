package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Classe-mãe de todas as entidades do LabShare.
 *
 * REUSO: todo cadastro tem id, cliente (tenant) e "ativo" (exclusão lógica).
 * Em vez de repetir esses 3 atributos em 10 classes, eles ficam aqui uma vez só.
 * É isso que permite o AbstractDao e o CrudService funcionarem para qualquer entidade.
 */
public abstract class EntidadeBase {

    protected Long id;
    protected String tenantId;
    protected boolean ativo = true;

    /** Exclusão lógica: o registro continua no banco (rastreabilidade), só some das listas. */
    public void desativar() {
        this.ativo = false;
    }

    @JsonIgnore
    public boolean isNova() {
        return id == null;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}
