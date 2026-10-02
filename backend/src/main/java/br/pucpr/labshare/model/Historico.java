package br.pucpr.labshare.model;

import java.time.LocalDateTime;

/** Registro de rastreabilidade (RNF10 / RN11): quem fez o quê, em qual registro e quando. */
public class Historico {

    private Long id;
    private String tenantId;
    private String entidade;
    private Long entidadeId;
    private String acao;
    private String descricao;
    private Long usuarioId;
    private String usuarioNome;  // JOIN (só leitura)
    private LocalDateTime dataHora;

    public Historico() {}

    public Historico(String tenantId, String entidade, Long entidadeId, String acao, String descricao, Long usuarioId) {
        this.tenantId = tenantId;
        this.entidade = entidade;
        this.entidadeId = entidadeId;
        this.acao = acao;
        this.descricao = descricao;
        this.usuarioId = usuarioId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getEntidade() { return entidade; }
    public void setEntidade(String entidade) { this.entidade = entidade; }
    public Long getEntidadeId() { return entidadeId; }
    public void setEntidadeId(Long entidadeId) { this.entidadeId = entidadeId; }
    public String getAcao() { return acao; }
    public void setAcao(String acao) { this.acao = acao; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getUsuarioNome() { return usuarioNome; }
    public void setUsuarioNome(String usuarioNome) { this.usuarioNome = usuarioNome; }
    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
}
