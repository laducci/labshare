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
@RestControllerAdvice
public class TratadorDeErros {

    private static final Logger log = LoggerFactory.getLogger(TratadorDeErros.class);

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<Map<String, String>> regraNegocio(RegraNegocioException e) {
        return resposta(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(NaoEncontradoException.class)
    public ResponseEntity<Map<String, String>> naoEncontrado(NaoEncontradoException e) {
        return resposta(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<Map<String, String>> acessoNegado(AcessoNegadoException e) {
        return resposta(HttpStatus.FORBIDDEN, e.getMessage());
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<Map<String, String>> semCabecalho(MissingRequestHeaderException e) {
        return resposta(HttpStatus.UNAUTHORIZED, "Faça login para continuar.");
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, IllegalArgumentException.class})
    public ResponseEntity<Map<String, String>> dadosInvalidos(Exception e) {
        return resposta(HttpStatus.BAD_REQUEST, "Dados inválidos: verifique os campos enviados.");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> integridade(DataIntegrityViolationException e) {
        String msg = e.getMostSpecificCause().getMessage();
        if (msg != null && msg.contains("email")) {
            return resposta(HttpStatus.CONFLICT, "Já existe um usuário com este e-mail.");
        }
        if (msg != null && msg.contains("foreign key")) {
            return resposta(HttpStatus.CONFLICT, "Este registro está vinculado a outros dados e não pode ser alterado assim.");
        }
        return resposta(HttpStatus.CONFLICT, "Operação não permitida pelo banco de dados.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> inesperado(Exception e) {
        if (e instanceof ErrorResponse erroHttp) {   // ex.: rota inexistente (404), método errado (405)
            return ResponseEntity.status(erroHttp.getStatusCode()).body(Map.of("erro", "Requisição inválida: " + e.getMessage()));
        }
        log.error("Erro inesperado", e);
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR, "Erro inesperado no servidor.");
    }

    private ResponseEntity<Map<String, String>> resposta(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(Map.of("erro", mensagem));
    }
}
