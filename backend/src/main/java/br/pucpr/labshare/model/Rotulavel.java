/*
 * ============================================================
 *  Rotulavel.java  |  Camada: Model (interface comum dos enums)
 *  Responsável na apresentação: Todos  |  Atividade: Q3 (compactação/reuso)
 * ------------------------------------------------------------
 *  O que faz: Interface implementada por todos os enums de status e pelo Perfil. Define o
 *  rótulo amigável (ex.: EM_USO -> "Em uso") e um método estático único de
 *  conversão texto -> enum, reaproveitado por todos (em vez de 6 cópias).
 *  Quem chama: StatusEquipamento, StatusReserva, StatusManutencao, StatusOcorrencia, StatusMulta, Perfil.
 *  Chama: nada.
 * ============================================================
 */
package br.pucpr.labshare.model;

import java.util.Arrays;

/**
 * Enums que têm um texto amigável (ex.: EM_USO -> "Em uso").
 * O frontend recebe/envia o rótulo; o banco guarda o nome (EM_USO).
 */
public interface Rotulavel {

    // Cada enum devolve aqui o seu texto amigável (o que aparece na tela).
    String getRotulo();

    /** Converte "Em uso" ou "EM_USO" para o valor do enum. Reutilizado por todos os enums. */
    // Método genérico: E é qualquer enum que também seja Rotulavel.
    // Procura a constante cujo nome OU rótulo seja igual ao texto (ignorando maiúsculas).
    // Texto desconhecido -> IllegalArgumentException -> TratadorDeErros devolve HTTP 400.
    static <E extends Enum<E> & Rotulavel> E converter(Class<E> tipo, String texto) {
        if (texto == null || texto.isBlank()) return null;
        return Arrays.stream(tipo.getEnumConstants())
                .filter(e -> e.name().equalsIgnoreCase(texto) || e.getRotulo().equalsIgnoreCase(texto))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Valor inválido: " + texto));
    }
}
