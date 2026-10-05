/*
 * ============================================================
 *  WebConfig.java  |  Camada: Config (configuração do Spring MVC)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (integração front x back), Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: (1) libera o CORS para o frontend React (Vite, porta 5173) chamar a
 *  API em /api/** na porta 8080; (2) registra o ContextoResolver, que monta o
 *  parâmetro "Contexto ctx" dos controllers a partir dos cabeçalhos.
 *  Quem chama: o Spring, automaticamente, ao iniciar a aplicação.
 *  Chama: ContextoResolver.
 * ============================================================
 */
package br.pucpr.labshare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

// @Configuration: diz ao Spring que esta classe contém configurações e deve ser lida na inicialização.
// WebMvcConfigurer: interface do Spring com métodos "ganchos" para personalizar o MVC.
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /** Libera o frontend (Vite, porta 5173) para chamar a API na porta 8080. */
    // CORS: o navegador bloqueia chamadas entre origens diferentes (porta 5173 -> 8080)
    // a menos que o servidor autorize explicitamente, como é feito aqui.
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }

    // Registra o ContextoResolver: a partir daqui qualquer controller pode receber "Contexto ctx".
    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new ContextoResolver());
    }
}
