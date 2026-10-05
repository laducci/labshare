/*
 * ============================================================
 *  RegraCentroCusto.java  |  Camada: Variabilidade (interface Strategy)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Strategy RegraCentroCusto), Q2 (variabilidade)
 * ------------------------------------------------------------
 *  O que faz: contrato da regra de centro de custo da reserva. A estratégia
 *  é escolhida pelo SeletorDeRegras conforme o recurso "costCenter" do cliente.
 *  Quem chama: ReservaService.antesDeSalvar (antes do INSERT/UPDATE da reserva).
 *  Implementações: CentroCustoNaoUtilizado, CentroCustoObrigatorio.
 * ============================================================
 */
package br.pucpr.labshare.variabilidade;

import br.pucpr.labshare.model.Reserva;

/**
 * ============================================================
 *  PADRÃO DE PROJETO: STRATEGY  (exemplo 3 de 3) - interface
 * ============================================================
 * Pergunta que varia: "A reserva precisa estar ligada a um centro de custo?"
 *   - CentroCustoNaoUtilizado -> Universidade e Escola Técnica
 *   - CentroCustoObrigatorio  -> Empresa Corporativa (recurso costCenter)
 */
public interface RegraCentroCusto {

    /** Valida/ajusta o centro de custo da reserva antes de gravar. */
    void aplicar(Reserva reserva);
}
