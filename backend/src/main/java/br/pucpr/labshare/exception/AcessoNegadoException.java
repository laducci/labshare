/*
 * ============================================================
 *  AcessoNegadoException.java  |  Camada: Exception (erro de permissão)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (variabilidade/recursos), Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: Exceção lançada quando o cliente (tenant) não tem o recurso ligado ou o
 *  perfil do usuário não tem permissão (RNF05). O TratadorDeErros a
 *  transforma em HTTP 403 { "erro": "..." }.
 *  Quem chama: TenantService (ex.: recurso desligado).   Chama: RuntimeException.
 * ============================================================
 */
package br.pucpr.labshare.exception;

/** Recurso desligado para o cliente ou perfil sem permissão. Vira HTTP 403. */
// Estende RuntimeException (exceção "não verificada"): não precisa de throws em cada método,
// ela "sobe" sozinha até o TratadorDeErros, que decide o status HTTP.
public class AcessoNegadoException extends RuntimeException {
    // Recebe a mensagem que será mostrada ao usuário na tela.
    public AcessoNegadoException(String mensagem) {
        super(mensagem);
    }
}
