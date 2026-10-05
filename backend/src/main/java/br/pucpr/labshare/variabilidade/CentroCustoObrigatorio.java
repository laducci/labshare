/*
 * ============================================================
 *  CentroCustoObrigatorio.java  |  Camada: Variabilidade (Strategy concreta)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Strategy RegraCentroCusto), Q2 (variabilidade)
 * ------------------------------------------------------------
 *  O que faz: estratégia para o cliente com o recurso "costCenter" ligado
 *  (Empresa Corporativa): a reserva só é aceita se tiver um centro de custo
 *  e se esse centro de custo existir e pertencer ao mesmo cliente (tenant).
 *  Quem chama: SeletorDeRegras (cria) e ReservaService.antesDeSalvar (usa).
 *  Chama: CentroCustoDao.buscarPorId (SELECT no banco).
 * ============================================================
 */
package br.pucpr.labshare.variabilidade;

import br.pucpr.labshare.dao.CentroCustoDao;
import br.pucpr.labshare.exception.RegraNegocioException;
import br.pucpr.labshare.model.Reserva;

/** Strategy concreta: toda reserva precisa de um centro de custo válido do próprio cliente. */
public class CentroCustoObrigatorio implements RegraCentroCusto {

    private final CentroCustoDao centroCustoDao;

    // Esta classe NÃO é um bean do Spring: o SeletorDeRegras faz "new" e passa o DAO
    // pelo construtor, porque a estratégia precisa consultar o banco.
    public CentroCustoObrigatorio(CentroCustoDao centroCustoDao) {
        this.centroCustoDao = centroCustoDao;
    }

    // Valida o centro de custo; qualquer falha vira RegraNegocioException -> HTTP 400 {erro} na tela.
    @Override
    public void aplicar(Reserva reserva) {
        if (reserva.getCentroCustoId() == null) {
            throw new RegraNegocioException("Selecione o centro de custo da reserva.");
        }
        // Busca filtrando também pelo tenantId: impede usar o centro de custo de OUTRO cliente.
        centroCustoDao.buscarPorId(reserva.getCentroCustoId(), reserva.getTenantId())
                .orElseThrow(() -> new RegraNegocioException("Centro de custo inválido."));
    }
}
