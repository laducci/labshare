/*
 * ============================================================
 *  SistemaExterno.java  |  Camada: Integração (leitura de sistemas externos)
 *  Responsável na apresentação: Todos  |  Atividade: Medição (AIE), Reuso (classe genérica)
 * ------------------------------------------------------------
 *  O que faz: base GENÉRICA para ler dados que pertencem a OUTROS sistemas da
 *  instituição (patrimônio, calendário, ensalamento, acadêmico/RH, compras).
 *  Na Análise de Pontos de Função, cada um desses conjuntos de dados é um
 *  AIE (Arquivo de Interface Externa): o LabShare só LÊ, nunca grava.
 *  No protótipo, cada sistema externo é simulado por um arquivo JSON em
 *  resources/integracoes/. Em produção, só esta classe mudaria (ex.: chamar
 *  uma API REST) e o resto do sistema continuaria igual.
 *  Quem chama: as subclasses (SistemaPatrimonio, CalendarioAcademico...).
 * ============================================================
 */
package br.pucpr.labshare.integracao;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Template Method + reuso: o algoritmo de leitura (abrir o arquivo, separar por cliente,
 * converter em objetos, guardar em cache) é o mesmo para os 6 sistemas externos.
 * Cada subclasse só informa: qual arquivo, qual classe e qual é a chave de busca.
 *
 * @param <T> tipo do registro externo (BemPatrimonial, Feriado, SalaEnsalamento...)
 */
public abstract class SistemaExterno<T> {

    private static final ObjectMapper JSON = new ObjectMapper()
            .findAndRegisterModules()   // entende LocalDate ("2026-10-12")
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    /** tenantId -> registros daquele cliente. Lido uma vez só (cache). */
    private final Map<String, List<T>> cache = new ConcurrentHashMap<>();
    private String nomeSistema = "";
    private String descricaoSistema = "";

    // ---------- passos que cada sistema externo informa ----------

    /** Nome do arquivo em resources/integracoes. Ex.: "patrimonio-bens.json" */
    protected abstract String arquivo();

    /** Classe Java de cada registro. */
    protected abstract Class<T> tipo();

    /** Chave usada para buscar um registro (número de patrimônio, matrícula, CNPJ...). */
    protected abstract String chave(T registro);

    // ---------- operações comuns (iguais para todos os AIEs) ----------

    /** Todos os registros do sistema externo para o cliente logado. */
    public List<T> listar(String tenantId) {
        carregarSeNecessario();
        return cache.getOrDefault(tenantId, Collections.emptyList());
    }

    /** Busca um registro pela chave (ignora maiúsculas/minúsculas e espaços). */
    public Optional<T> buscar(String tenantId, String chave) {
        if (chave == null || chave.isBlank()) return Optional.empty();
        return listar(tenantId).stream()
                .filter(r -> chave(r).equalsIgnoreCase(chave.trim()))
                .findFirst();
    }

    public String getNomeSistema() {
        carregarSeNecessario();
        return nomeSistema;
    }

    public String getDescricaoSistema() {
        carregarSeNecessario();
        return descricaoSistema;
    }

    /** Lê o JSON uma única vez e separa os registros por cliente (tenant). */
    private synchronized void carregarSeNecessario() {
        if (!cache.isEmpty() || !nomeSistema.isEmpty()) return;
        try (InputStream in = getClass().getResourceAsStream("/integracoes/" + arquivo())) {
            if (in == null) throw new IllegalStateException("Arquivo do sistema externo não encontrado: " + arquivo());
            JsonNode raiz = JSON.readTree(in);
            nomeSistema = raiz.path("sistema").asText();
            descricaoSistema = raiz.path("descricao").asText();
            raiz.path("dados").fields().forEachRemaining(cliente -> {
                List<T> registros = new ArrayList<>();
                for (JsonNode item : cliente.getValue()) {
                    registros.add(JSON.convertValue(item, tipo()));
                }
                cache.put(cliente.getKey(), Collections.unmodifiableList(registros));
            });
        } catch (IOException e) {
            throw new IllegalStateException("Falha ao ler o sistema externo " + arquivo(), e);
        }
    }
}
