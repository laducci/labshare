/*
 * ============================================================
 *  NaoEncontradoException.java  |  Camada: Exception (registro não encontrado)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (CRUDs), Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: Exceção lançada quando o id buscado não existe, está inativo ou pertence a
 *  outro cliente (o filtro por tenant_id esconde dados de outros clientes).
 *  O TratadorDeErros a transforma em HTTP 404 { "erro": "..." }.
 *  Quem chama: CrudService, ProcessoChecklist, TenantService, NotificacaoService.   Chama: RuntimeException.
 * ============================================================
 */
package br.pucpr.labshare.exception;

/** Registro não existe (ou é de outro cliente). Vira HTTP 404. */
// RuntimeException: não obriga try/catch; o TratadorDeErros captura em um lugar só.
public class NaoEncontradoException extends RuntimeException {
    // Monta a mensagem padrão a partir do nome da entidade e do id. Ex.: "Equipamento 7 não encontrado(a)."
    // Reuso: todos os CRUDs usam o mesmo construtor, em vez de cada um escrever sua mensagem.
    public NaoEncontradoException(String entidade, Object id) {
        super(entidade + " " + id + " não encontrado(a).");
    }
}
