package br.pucpr.labshare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Ponto de entrada do backend do LabShare.
 * Rodar: ./mvnw spring-boot:run   (API em http://localhost:8080/api)
 */
@SpringBootApplication
public class LabShareApplication {
    public static void main(String[] args) {
        SpringApplication.run(LabShareApplication.class, args);
    }
}
