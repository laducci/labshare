/*
 * ============================================================
 *  Historico.java  |  Camada: Model (entidade / tabela historico)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (rastreabilidade), RN11 / RNF10
 * ------------------------------------------------------------
 *  O que faz: Linha de auditoria: registra quem fez qual ação, em qual registro e quando
 *  (ex.: "Reserva 12 - APROVADA por Ana em 05/10"). Nunca é apagada: é o
 *  histórico exigido por RN11 (manter histórico) e RNF10 (rastreabilidade).
 *  Quem chama: HistoricoService (cria), HistoricoDao (grava/lista).   Chama: nada.
 * ============================================================
 */
package br.pucpr.labshare.model;

import java.time.LocalDateTime;

/** Registro de rastreabilidade (RNF10 / RN11): quem fez o quê, em qual registro e quando. */
// Não estende EntidadeBase: histórico não tem exclusão lógica nem CRUD (só inserção e consulta).
public class Historico {

    private Long id;
    private String tenantId;
    // Nome da entidade afetada (ex.: "Reserva") e o id do registro (entidadeId).
    private String entidade;
    private Long entidadeId;
    private String acao;
    private String descricao;
    private Long usuarioId;
    private String usuarioNome;  // JOIN (só leitura)
    private LocalDateTime dataHora;

    // Construtor vazio: usado pelo DAO (RowMapper) ao ler do banco e pelo Jackson.
    public Historico() {}

    // Construtor completo: usado pelo HistoricoService para registrar uma ação. dataHora é preenchida pelo banco.
    public Historico(String tenantId, String entidade, Long entidadeId, String acao, String descricao, Long usuarioId) {
        this.tenantId = tenantId;
        this.entidade = entidade;
        this.entidadeId = entidadeId;
        this.acao = acao;
        this.descricao = descricao;
        this.usuarioId = usuarioId;
    }

    // Getters e setters: usados pelo Jackson para converter objeto <-> JSON (e pelos DAOs/RowMapper ao ler do banco).
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
