/*
 * ============================================================
 *  ConfiguracaoEmprestimo.java  |  Camada: Config (configuração global)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Singleton, exemplo 1 de 2)
 * ------------------------------------------------------------
 *  O que faz: lê UMA única vez o arquivo regras-emprestimo.properties
 *  (prazo máximo, valor da multa diária, horário de devolução e textos
 *  das regras) e guarda esses valores em memória para o sistema inteiro.
 *  Quem chama: ReservaService (prazo máximo), MultaPorDiaDeAtraso (Strategy de multa),
 *              LembreteDevolucao (horário) e ConsultaController (GET /api/configuracoes/emprestimo).
 *  Chama: o arquivo src/main/resources/regras-emprestimo.properties (via classpath).
 * ============================================================
 */
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
 * e ConsultaController (regras mostradas na tela "Confirmar reserva",
 * via GET /api/configuracoes/emprestimo).
 *
 * Reuso: qualquer sistema da Linha de Produto que precise de configuração lida uma vez
 * (ex.: aluguel de salas, almoxarifado) pode reaproveitar esta classe trocando só o arquivo.
 *
 * "final" na classe: ninguém pode criar uma subclasse e burlar o Singleton.
 */
public final class ConfiguracaoEmprestimo {

    // SINGLETON (passo 2): atributo STATIC = pertence à classe, não a um objeto.
    // Começa null e só é preenchido na primeira chamada de getInstance().
    private static ConfiguracaoEmprestimo instancia;   // a única instância

    // Valores lidos do arquivo. São "final" = depois de carregados não mudam
    // (objeto imutável, seguro para ser compartilhado por várias requisições ao mesmo tempo).
    private final int prazoMaximoDias;
    private final BigDecimal valorMultaDiaria;
    private final String horarioDevolucao;
    private final List<String> regras;

    /** Construtor privado: só a própria classe pode criar o objeto. */
    private ConfiguracaoEmprestimo() {
        Properties props = new Properties();
        // try-with-resources: fecha o arquivo automaticamente no final.
        // getResourceAsStream procura o arquivo dentro de src/main/resources (classpath).
        try (InputStream in = getClass().getResourceAsStream("/regras-emprestimo.properties")) {
            if (in != null) {
                // UTF-8 para os acentos das regras ("é", "às") aparecerem corretos na tela.
                props.load(new InputStreamReader(in, StandardCharsets.UTF_8));
            }
        } catch (IOException e) {
            throw new IllegalStateException("Não foi possível ler regras-emprestimo.properties", e);
        }
        // O segundo parâmetro de getProperty é o valor padrão, usado se a chave não existir no arquivo.
        this.prazoMaximoDias = Integer.parseInt(props.getProperty("prazo.maximo.dias", "7"));
        // BigDecimal (e não double) porque é dinheiro: evita erros de arredondamento.
        this.valorMultaDiaria = new BigDecimal(props.getProperty("multa.valor.diario", "5.00"));
        this.horarioDevolucao = props.getProperty("horario.devolucao", "18:00");

        // Lê regra.1, regra.2, regra.3... até não existir a próxima chave.
        // Assim dá para acrescentar regras só editando o arquivo, sem mexer no código.
        List<String> lista = new ArrayList<>();
        for (int i = 1; props.containsKey("regra." + i); i++) {
            lista.add(props.getProperty("regra." + i));
        }
        // Lista somente leitura: quem pegar a lista não consegue alterá-la.
        this.regras = Collections.unmodifiableList(lista);
        // Mensagem no console: prova na apresentação que o arquivo é lido uma única vez.
        System.out.println("[Singleton] ConfiguracaoEmprestimo criada UMA vez (arquivo lido do disco).");
    }

    /** Ponto global de acesso à instância única. */
    // SINGLETON (passos 3 e 4): cria só se ainda não existe (lazy) e "synchronized"
    // impede que duas threads entrem aqui ao mesmo tempo e criem dois objetos.
    public static synchronized ConfiguracaoEmprestimo getInstance() {
        if (instancia == null) {
            instancia = new ConfiguracaoEmprestimo();
        }
        return instancia;
    }

    // Getters: só leitura (não há setters, a configuração não muda em tempo de execução).
    // Também são usados pelo Jackson para converter o objeto em JSON na resposta da API.
    public int getPrazoMaximoDias() { return prazoMaximoDias; }
    public BigDecimal getValorMultaDiaria() { return valorMultaDiaria; }
    public String getHorarioDevolucao() { return horarioDevolucao; }
    public List<String> getRegras() { return regras; }
}
