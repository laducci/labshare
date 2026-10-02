package br.pucpr.labshare.exception;

/** Lançada quando uma regra de negócio é violada. Vira HTTP 400 com a mensagem para o usuário. */
public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
