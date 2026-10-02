package br.pucpr.labshare.model;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Cliente (instituição) que usa o LabShare: Universidade, Empresa, Escola Técnica...
 * VARIABILIDADE: cada tenant tem o seu mapa de recursos (feature flags).
 */
public class Tenant {

    public static final String APROVACAO_GESTOR = "approvalRequired";
    public static final String CENTRO_CUSTO = "costCenter";
    public static final String MULTA_ATRASO = "lateFee";

    private String id;
    private String nome;
    private String segmento;
    private Map<String, Boolean> features = new LinkedHashMap<>();

    public Tenant() {}

    public Tenant(String id, String nome, String segmento) {
        this.id = id;
        this.nome = nome;
        this.segmento = segmento;
    }

    /** O cliente tem este recurso ligado? Ex.: possuiRecurso("lateFee") */
    public boolean possuiRecurso(String recurso) {
        return Boolean.TRUE.equals(features.get(recurso));
    }

    public void alterarRecurso(String recurso, boolean habilitado) {
        features.put(recurso, habilitado);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getSegmento() { return segmento; }
    public void setSegmento(String segmento) { this.segmento = segmento; }
    public Map<String, Boolean> getFeatures() { return features; }
    public void setFeatures(Map<String, Boolean> features) { this.features = features; }
}
