/*
 * ============================================================
 *  ContextoResolver.java  |  Camada: Config (infraestrutura do Spring MVC)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (multi-cliente), Q3 (reuso / compactação)
 * ------------------------------------------------------------
 *  O que faz: ensina o Spring a montar automaticamente o parâmetro "Contexto ctx"
 *  dos métodos de controller, lendo os cabeçalhos X-Tenant-Id e X-Usuario-Id
 *  que o frontend (services/api.js) envia em toda requisição.
 *  Quem chama: o próprio Spring, antes de executar cada método de controller
 *              (registrado em WebConfig.addArgumentResolvers).
 *  Chama: cria um objeto Contexto.
 * ============================================================
 */
package br.pucpr.labshare.config;

import org.springframework.core.MethodParameter;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * Sempre que um método de controller tiver um parâmetro "Contexto ctx",
 * esta classe lê os cabeçalhos da requisição e monta o objeto.
 * REUSO: evita repetir @RequestHeader em dezenas de métodos.
 *
 * HandlerMethodArgumentResolver é uma interface do Spring: quem a implementa
 * diz "eu sei preencher este tipo de parâmetro".
 */
public class ContextoResolver implements HandlerMethodArgumentResolver {

    // Pergunta do Spring: "você sabe preencher este parâmetro?".
    // Responde true só quando o tipo do parâmetro é Contexto.
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterType().equals(Contexto.class);
    }

    // Monta o Contexto a partir dos cabeçalhos HTTP da requisição.
    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mav,
                                  NativeWebRequest request, WebDataBinderFactory binderFactory) throws Exception {
        // X-Tenant-Id é OBRIGATÓRIO: sem saber o cliente não dá para filtrar o SQL por tenant_id.
        // Se faltar, o Spring responde HTTP 400 (cabeçalho ausente).
        String tenantId = request.getHeader("X-Tenant-Id");
        if (tenantId == null || tenantId.isBlank()) {
            throw new MissingRequestHeaderException("X-Tenant-Id", parameter);
        }
        // X-Usuario-Id é OPCIONAL (ex.: telas antes do login). Se não vier, fica null.
        String usuario = request.getHeader("X-Usuario-Id");
        Long usuarioId = (usuario == null || usuario.isBlank()) ? null : Long.valueOf(usuario);
        return new Contexto(tenantId, usuarioId);
    }
}
