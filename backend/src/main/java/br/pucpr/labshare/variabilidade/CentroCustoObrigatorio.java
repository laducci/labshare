package br.pucpr.labshare.variabilidade;

import br.pucpr.labshare.dao.CentroCustoDao;
import br.pucpr.labshare.exception.RegraNegocioException;
import br.pucpr.labshare.model.Reserva;

/** Strategy concreta: toda reserva precisa de um centro de custo válido do próprio cliente. */
public class CentroCustoObrigatorio implements RegraCentroCusto {

    private final CentroCustoDao centroCustoDao;

    public CentroCustoObrigatorio(CentroCustoDao centroCustoDao) {
        this.centroCustoDao = centroCustoDao;
    }

    @Override
    public void aplicar(Reserva reserva) {
        if (reserva.getCentroCustoId() == null) {
            throw new RegraNegocioException("Selecione o centro de custo da reserva.");
        }
        centroCustoDao.buscarPorId(reserva.getCentroCustoId(), reserva.getTenantId())
                .orElseThrow(() -> new RegraNegocioException("Centro de custo inválido."));
    }
}
