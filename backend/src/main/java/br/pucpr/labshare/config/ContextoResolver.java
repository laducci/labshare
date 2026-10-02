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
 */
public class ContextoResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterType().equals(Contexto.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mav,
                                  NativeWebRequest request, WebDataBinderFactory binderFactory) throws Exception {
        String tenantId = request.getHeader("X-Tenant-Id");
        if (tenantId == null || tenantId.isBlank()) {
            throw new MissingRequestHeaderException("X-Tenant-Id", parameter);
        }
        String usuario = request.getHeader("X-Usuario-Id");
        Long usuarioId = (usuario == null || usuario.isBlank()) ? null : Long.valueOf(usuario);
        return new Contexto(tenantId, usuarioId);
    }
}
