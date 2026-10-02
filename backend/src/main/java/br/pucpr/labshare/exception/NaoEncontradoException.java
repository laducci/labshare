package br.pucpr.labshare.exception;

/** Registro não existe (ou é de outro cliente). Vira HTTP 404. */
public class NaoEncontradoException extends RuntimeException {
    public NaoEncontradoException(String entidade, Object id) {
        super(entidade + " " + id + " não encontrado(a).");
    }
}
