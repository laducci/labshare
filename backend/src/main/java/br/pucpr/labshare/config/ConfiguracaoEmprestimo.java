package br.pucpr.labshare.config;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Properties;

/**
 * ============================================================
 *  PADRÃO DE PROJETO: SINGLETON  (exemplo 1 de 2)
 * ============================================================
 * Problema: as regras de empréstimo (prazo máximo, valor da multa diária,
 * textos das regras) ficam no arquivo regras-emprestimo.properties.
 * Não faz sentido ler o arquivo do disco toda vez que alguém faz uma reserva.
 *
 * Solução: existe UMA única instância desta classe no sistema inteiro.
 *  1. O construtor é PRIVADO -> ninguém consegue dar "new ConfiguracaoEmprestimo()".
 *  2. A instância fica guardada em um atributo STATIC.
 *  3. getInstance() cria a instância só na primeira chamada (inicialização "preguiçosa" / lazy)
 *     e devolve sempre a mesma nas próximas.
 *  4. "synchronized" garante que duas requisições simultâneas não criem duas instâncias.
 *
 * Onde é usado: ReservaService (prazo máximo), MultaPorDiaDeAtraso (valor diário)
 * e ConfiguracaoController (regras mostradas na tela "Confirmar reserva").
 *
 * Reuso: qualquer sistema da Linha de Produto que precise de configuração lida uma vez
 * (ex.: aluguel de salas, almoxarifado) pode reaproveitar esta classe trocando só o arquivo.
 */
public final class ConfiguracaoEmprestimo {

    private static ConfiguracaoEmprestimo instancia;   // a única instância

    private final int prazoMaximoDias;
    private final BigDecimal valorMultaDiaria;
    private final String horarioDevolucao;
    private final List<String> regras;

    /** Construtor privado: só a própria classe pode criar o objeto. */
    private ConfiguracaoEmprestimo() {
        Properties props = new Properties();
        try (InputStream in = getClass().getResourceAsStream("/regras-emprestimo.properties")) {
            if (in != null) {
                props.load(new InputStreamReader(in, StandardCharsets.UTF_8));
            }
        } catch (IOException e) {
            throw new IllegalStateException("Não foi possível ler regras-emprestimo.properties", e);
        }
        this.prazoMaximoDias = Integer.parseInt(props.getProperty("prazo.maximo.dias", "7"));
        this.valorMultaDiaria = new BigDecimal(props.getProperty("multa.valor.diario", "5.00"));
        this.horarioDevolucao = props.getProperty("horario.devolucao", "18:00");

        List<String> lista = new ArrayList<>();
        for (int i = 1; props.containsKey("regra." + i); i++) {
            lista.add(props.getProperty("regra." + i));
        }
        this.regras = Collections.unmodifiableList(lista);
        System.out.println("[Singleton] ConfiguracaoEmprestimo criada UMA vez (arquivo lido do disco).");
    }

    /** Ponto global de acesso à instância única. */
    public static synchronized ConfiguracaoEmprestimo getInstance() {
        if (instancia == null) {
            instancia = new ConfiguracaoEmprestimo();
        }
        return instancia;
    }

    public int getPrazoMaximoDias() { return prazoMaximoDias; }
    public BigDecimal getValorMultaDiaria() { return valorMultaDiaria; }
    public String getHorarioDevolucao() { return horarioDevolucao; }
    public List<String> getRegras() { return regras; }
}
