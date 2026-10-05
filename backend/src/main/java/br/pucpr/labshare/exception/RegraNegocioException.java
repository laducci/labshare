/*
 * ============================================================
 *  RegraNegocioException.java  |  Camada: Exception (violação de regra de negócio)
 *  Responsável na apresentação: Todos  |  Atividade: Q1/Q2 (regras RN01..RN12), Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: Exceção usada em TODAS as regras de negócio (RN01..RN12): quando uma regra
 *  é violada, o model/service lança esta exceção com uma mensagem amigável.
 *  Fluxo: RegraNegocioException -> TratadorDeErros -> HTTP 400 { "erro": "..." }.
 *  Quem chama: models (Equipamento, Reserva, Manutencao, Multa), services e checklist.   Chama: RuntimeException.
 * ============================================================
 */
package br.pucpr.labshare.exception;

/** Lançada quando uma regra de negócio é violada. Vira HTTP 400 com a mensagem para o usuário. */
// RuntimeException: interrompe a operação na hora (e o @Transactional desfaz o que foi
// gravado no banco), sem precisar declarar throws em cada método.
public class RegraNegocioException extends RuntimeException {
    // A mensagem chega até a tela do React, que a exibe para o usuário.
    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
