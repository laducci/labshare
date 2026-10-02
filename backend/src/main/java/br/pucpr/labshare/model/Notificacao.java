package br.pucpr.labshare.model;

import java.time.LocalDateTime;

/** Aviso para um usuário (lembrete de devolução, aprovação pendente, manutenção concluída...). */
public class Notificacao extends EntidadeBase {

    private Long usuarioId;
    private String titulo;
    private String mensagem;
    private boolean lida;
    private LocalDateTime dataCriacao = LocalDateTime.now();

    public Notificacao() {}

    public Notificacao(String tenantId, Long usuarioId, String titulo, String mensagem) {
        this.tenantId = tenantId;
        this.usuarioId = usuarioId;
        this.titulo = titulo;
        this.mensagem = mensagem;
    }

    public void marcarComoLida() {
        this.lida = true;
    }

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
