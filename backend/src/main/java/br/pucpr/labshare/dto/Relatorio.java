/*
 * ============================================================
 *  Relatorio.java  |  Camada: DTO (saída dos relatórios)
 *  Responsável na apresentação: Todos  |  Atividade: Medição (formato comum das 6 SEs)
 * ------------------------------------------------------------
 *  O que faz: "envelope" único devolvido por todos os relatórios: título,
 *  período, linhas (tabela) e totais calculados. Como o formato é o mesmo,
 *  o frontend usa UMA tela genérica (RelatorioView) para mostrar os seis.
 * ============================================================
 */
package br.pucpr.labshare.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record Relatorio(String codigo, String titulo, String descricao, LocalDate inicio, LocalDate fim,
                        List<Map<String, Object>> linhas, Map<String, Object> totais, LocalDateTime geradoEm) {
}
