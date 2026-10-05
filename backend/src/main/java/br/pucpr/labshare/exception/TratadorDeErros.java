/*
 * ============================================================
 *  TratadorDeErros.java  |  Camada: Exception (tratamento global de erros)
 *  Responsável na apresentação: Todos  |  Atividade: Q3 (reuso), Q1/Q2 (regras de negócio)
 * ------------------------------------------------------------
 *  O que faz: Intercepta as exceções lançadas por QUALQUER controller e devolve sempre o
 *  mesmo formato JSON: { "erro": "mensagem" }, com o status HTTP adequado
 *  (400, 401, 403, 404, 409 ou 500). O frontend (api.js) lê o campo "erro".
 *  Quem chama: o próprio Spring, quando uma exceção escapa de um controller.   Chama: ResponseEntity.
 * ============================================================
 */
package br.pucpr.labshare.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.ErrorResponse;

import java.util.Map;

/**
 * Converte exceções em respostas JSON padronizadas: { "erro": "mensagem" }.
 * REUSO: um único lugar trata erros de TODOS os controllers.
 */
// @RestControllerAdvice: diz ao Spring que esta classe "aconselha" todos os @RestController.
// Quando um controller lança exceção, o Spring procura aqui um método @ExceptionHandler
// compatível e devolve o que ele retornar (já convertido em JSON).
@RestControllerAdvice
public class TratadorDeErros {

    // Logger: registra no console do servidor só os erros inesperados (para depuração).
    private static final Logger log = LoggerFactory.getLogger(TratadorDeErros.class);

    // @ExceptionHandler(X.class): este método trata exceções do tipo X.
    // Regra de negócio violada (RN01..RN12) -> HTTP 400 Bad Request com a mensagem da regra.
    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<Map<String, String>> regraNegocio(RegraNegocioException e) {
        return resposta(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    // Registro inexistente ou de outro cliente -> HTTP 404 Not Found.
    @ExceptionHandler(NaoEncontradoException.class)
    public ResponseEntity<Map<String, String>> naoEncontrado(NaoEncontradoException e) {
        return resposta(HttpStatus.NOT_FOUND, e.getMessage());
    }

    // Sem permissão / recurso desligado para o cliente (RNF05) -> HTTP 403 Forbidden.
    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<Map<String, String>> acessoNegado(AcessoNegadoException e) {
        return resposta(HttpStatus.FORBIDDEN, e.getMessage());
    }

    // Faltou o cabeçalho X-Tenant-Id ou X-Usuario-Id (usuário não logado) -> HTTP 401 Unauthorized.
    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<Map<String, String>> semCabecalho(MissingRequestHeaderException e) {
        return resposta(HttpStatus.UNAUTHORIZED, "Faça login para continuar.");
    }

    // JSON mal formado ou valor inválido (ex.: status que não existe no enum, via Rotulavel.converter)
    // -> HTTP 400 com mensagem genérica, sem expor detalhes internos.
    @ExceptionHandler({HttpMessageNotReadableException.class, IllegalArgumentException.class})
    public ResponseEntity<Map<String, String>> dadosInvalidos(Exception e) {
        return resposta(HttpStatus.BAD_REQUEST, "Dados inválidos: verifique os campos enviados.");
    }

    // Erro de restrição do PostgreSQL (UNIQUE, FOREIGN KEY) -> HTTP 409 Conflict.
    // Olha a causa mais específica para dar uma mensagem compreensível ao usuário.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> integridade(DataIntegrityViolationException e) {
        String msg = e.getMostSpecificCause().getMessage();
        // Violou o UNIQUE do e-mail na tabela usuario.
        if (msg != null && msg.contains("email")) {
            return resposta(HttpStatus.CONFLICT, "Já existe um usuário com este e-mail.");
        }
        // Violou uma chave estrangeira (registro ainda referenciado por outra tabela).
        if (msg != null && msg.contains("foreign key")) {
            return resposta(HttpStatus.CONFLICT, "Este registro está vinculado a outros dados e não pode ser alterado assim.");
        }
        return resposta(HttpStatus.CONFLICT, "Operação não permitida pelo banco de dados.");
    }

    // "Rede de segurança": qualquer outra exceção. Erros HTTP do próprio Spring mantêm seu status;
    // o resto vira 500 e é registrado no log (o usuário não vê o stack trace).
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> inesperado(Exception e) {
        if (e instanceof ErrorResponse erroHttp) {   // ex.: rota inexistente (404), método errado (405)
            return ResponseEntity.status(erroHttp.getStatusCode()).body(Map.of("erro", "Requisição inválida: " + e.getMessage()));
        }
        log.error("Erro inesperado", e);
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR, "Erro inesperado no servidor.");
    }

    // Método auxiliar reutilizado por todos os handlers: monta o corpo { "erro": mensagem } com o status.
    private ResponseEntity<Map<String, String>> resposta(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(Map.of("erro", mensagem));
    }
}
