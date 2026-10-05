/*
 * ============================================================
 *  Notificacao.java  |  Camada: Model (entidade / tabela notificacao)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Template Method NotificacaoTemplate), RN12
 * ------------------------------------------------------------
 *  O que faz: Aviso para um usuário (lembrete de devolução - RN12, reserva aguardando
 *  aprovação, manutenção concluída). É criada pelo NotificacaoTemplate e suas
 *  subclasses e listada na tela Notifications.
 *  Quem chama: NotificacaoTemplate (e subclasses), NotificacaoDao, NotificacaoService, NotificacaoController.
 *  Chama: EntidadeBase.
 * ============================================================
 */
package br.pucpr.labshare.model;

import java.time.LocalDateTime;

/** Aviso para um usuário (lembrete de devolução, aprovação pendente, manutenção concluída...). */
// Herda id, tenantId e ativo de EntidadeBase.
public class Notificacao extends EntidadeBase {

    private Long usuarioId;
    private String titulo;
    private String mensagem;
    private boolean lida;
    private LocalDateTime dataCriacao = LocalDateTime.now();

    // Construtor vazio: usado pelo DAO ao ler do banco e pelo Jackson.
    public Notificacao() {}

    // Construtor usado pelo NotificacaoTemplate para criar um aviso novo.
    public Notificacao(String tenantId, Long usuarioId, String titulo, String mensagem) {
        this.tenantId = tenantId;
        this.usuarioId = usuarioId;
        this.titulo = titulo;
        this.mensagem = mensagem;
    }

    // Usuário abre/clica na notificação -> NotificacaoController -> NotificacaoService.
    public void marcarComoLida() {
        this.lida = true;
    }

    // Getters e setters: usados pelo Jackson para converter objeto <-> JSON (e pelos DAOs/RowMapper ao ler do banco).
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }
    public boolean isLida() { return lida; }
    public void setLida(boolean lida) { this.lida = lida; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
}
