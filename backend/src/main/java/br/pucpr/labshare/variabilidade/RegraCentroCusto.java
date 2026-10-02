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
