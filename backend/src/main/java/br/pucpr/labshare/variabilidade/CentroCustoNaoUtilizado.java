/*
 * ============================================================
 *  CentroCustoNaoUtilizado.java  |  Camada: Variabilidade (Strategy concreta)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Strategy RegraCentroCusto), Q2 (variabilidade)
 * ------------------------------------------------------------
 *  O que faz: estratégia para clientes SEM o recurso "costCenter"
 *  (Universidade e Escola Técnica): simplesmente apaga o centro de custo
 *  da reserva, caso a tela tenha mandado algum.
 *  Quem chama: SeletorDeRegras (cria) e ReservaService.antesDeSalvar (usa).   Chama: nada.
 * ============================================================
 */
package br.pucpr.labshare.variabilidade;

import br.pucpr.labshare.model.Reserva;

/** Strategy concreta: o cliente não usa centro de custo, então o campo é ignorado. */
public class CentroCustoNaoUtilizado implements RegraCentroCusto {

    // Garante que a coluna centro_custo_id seja gravada como NULL para este cliente.
    @Override
    public void aplicar(Reserva reserva) {
        reserva.setCentroCustoId(null);
    }
}
