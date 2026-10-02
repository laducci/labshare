package br.pucpr.labshare.model;

import java.util.Arrays;

/**
 * Enums que têm um texto amigável (ex.: EM_USO -> "Em uso").
 * O frontend recebe/envia o rótulo; o banco guarda o nome (EM_USO).
 */
public interface Rotulavel {

    String getRotulo();

    /** Converte "Em uso" ou "EM_USO" para o valor do enum. Reutilizado por todos os enums. */
    static <E extends Enum<E> & Rotulavel> E converter(Class<E> tipo, String texto) {
        if (texto == null || texto.isBlank()) return null;
        return Arrays.stream(tipo.getEnumConstants())
                .filter(e -> e.name().equalsIgnoreCase(texto) || e.getRotulo().equalsIgnoreCase(texto))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Valor inválido: " + texto));
    }
}
