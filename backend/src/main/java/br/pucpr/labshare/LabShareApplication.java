/*
 * ============================================================
 *  LabShareApplication.java  |  Camada: Inicialização (classe main do Spring Boot)
 *  Responsável na apresentação: Todos  |  Atividade: Q1/Q2/Q3 (sobe o backend inteiro)
 * ------------------------------------------------------------
 *  O que faz: Ponto de entrada do backend. Ao rodar o main, o Spring Boot sobe o servidor
 *  web (Tomcat embutido na porta 8080), procura todas as classes anotadas
 *  (@RestController, @Service, @Repository, @Component...) e monta os objetos.
 *  Quem chama: a JVM (./mvnw spring-boot:run).   Chama: SpringApplication.run.
 * ============================================================
 */
package br.pucpr.labshare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Ponto de entrada do backend do LabShare.
 * Rodar: ./mvnw spring-boot:run   (API em http://localhost:8080/api)
 */
// @SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan:
// liga a configuração automática (JdbcTemplate, Jackson, servidor web) e faz o Spring
// varrer o pacote br.pucpr.labshare e subpacotes atrás dos componentes do sistema.
@SpringBootApplication
public class LabShareApplication {
    // Método main: inicia o contexto do Spring; a partir daqui a API fica escutando requisições.
    public static void main(String[] args) {
        SpringApplication.run(LabShareApplication.class, args);
    }
}
