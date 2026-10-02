package br.pucpr.labshare.exception;

/** Recurso desligado para o cliente ou perfil sem permissão. Vira HTTP 403. */
public class AcessoNegadoException extends RuntimeException {
    public AcessoNegadoException(String mensagem) {
        super(mensagem);
    }
}
