/*
 * ============================================================
 *  Tenant.java  |  Camada: Model (entidade / tabela tenant)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (exemplo de variabilidade: tenant_recurso, hasFeature)
 * ------------------------------------------------------------
 *  O que faz: Cliente (instituição) que usa o LabShare: Universidade, Empresa Corporativa,
 *  Escola Técnica... Cada um tem seu mapa de recursos ligados/desligados
 *  (feature flags, tabela tenant_recurso). É a base da variabilidade do sistema.
 *  Quem chama: TenantDao, TenantService, FeatureFlagCache, SeletorDeRegras, AuthService (LoginResponse).
 *  Chama: nada.
 * ============================================================
 */
package br.pucpr.labshare.model;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Cliente (instituição) que usa o LabShare: Universidade, Empresa, Escola Técnica...
 * VARIABILIDADE: cada tenant tem o seu mapa de recursos (feature flags).
 */
// Não estende EntidadeBase: o próprio tenant é o "dono" dos dados, seu id é um texto (ex.: "universidade").
public class Tenant {

    // Nomes dos recursos (feature flags) que mudam o comportamento do sistema:
    //  approvalRequired -> reserva precisa de aprovação do gestor (Strategy RegraAprovacao)
    //  costCenter       -> reserva exige centro de custo (Strategy RegraCentroCusto)
    //  lateFee          -> devolução atrasada gera multa (Strategy CalculoMulta)
    public static final String APROVACAO_GESTOR = "approvalRequired";
    public static final String CENTRO_CUSTO = "costCenter";
    public static final String MULTA_ATRASO = "lateFee";

    private String id;
    private String nome;
    private String segmento;
    // Mapa recurso -> ligado? (vem da tabela tenant_recurso). LinkedHashMap mantém a ordem de inserção.
    // No frontend esse mapa é usado pelo hasFeature() para mostrar/esconder telas.
    private Map<String, Boolean> features = new LinkedHashMap<>();

    // Construtor vazio: Jackson e DAO.
    public Tenant() {}

    public Tenant(String id, String nome, String segmento) {
        this.id = id;
        this.nome = nome;
        this.segmento = segmento;
    }

    /** O cliente tem este recurso ligado? Ex.: possuiRecurso("lateFee") */
    // Boolean.TRUE.equals(...) evita NullPointerException quando o recurso nem está no mapa (= desligado).
    public boolean possuiRecurso(String recurso) {
        return Boolean.TRUE.equals(features.get(recurso));
    }

    // Liga/desliga um recurso apenas no objeto em memória (não grava no banco sozinho; quem persiste é o DAO).
    public void alterarRecurso(String recurso, boolean habilitado) {
        features.put(recurso, habilitado);
    }

    // Getters e setters: usados pelo Jackson para converter objeto <-> JSON (e pelos DAOs/RowMapper ao ler do banco).
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getSegmento() { return segmento; }
    public void setSegmento(String segmento) { this.segmento = segmento; }
    public Map<String, Boolean> getFeatures() { return features; }
    public void setFeatures(Map<String, Boolean> features) { this.features = features; }
}
