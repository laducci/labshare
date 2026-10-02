package br.pucpr.labshare.variabilidade;

import br.pucpr.labshare.dao.CentroCustoDao;
import br.pucpr.labshare.model.Tenant;
import br.pucpr.labshare.service.TenantService;
import org.springframework.stereotype.Component;

/**
 * Escolhe as estratégias (Strategy) de cada cliente a partir dos recursos ligados no banco.
 * É o ÚNICO lugar do sistema que olha as feature flags para decidir comportamento de negócio.
 *
 *   recurso ligado?        estratégia escolhida
 *   approvalRequired  ->   AprovacaoPeloGestor   | senão AprovacaoAutomatica
 *   lateFee           ->   MultaPorDiaDeAtraso   | senão SemMulta
 *   costCenter        ->   CentroCustoObrigatorio| senão CentroCustoNaoUtilizado
 */
@Component
public class SeletorDeRegras {

    private final TenantService tenants;
    private final CentroCustoDao centroCustoDao;

    public SeletorDeRegras(TenantService tenants, CentroCustoDao centroCustoDao) {
        this.tenants = tenants;
        this.centroCustoDao = centroCustoDao;
    }

    public RegrasDoCliente para(String tenantId) {
        RegraAprovacao aprovacao = tenants.possuiRecurso(tenantId, Tenant.APROVACAO_GESTOR)
                ? new AprovacaoPeloGestor()
                : new AprovacaoAutomatica();

        CalculoMulta multa = tenants.possuiRecurso(tenantId, Tenant.MULTA_ATRASO)
                ? new MultaPorDiaDeAtraso()
                : new SemMulta();

        RegraCentroCusto centroCusto = tenants.possuiRecurso(tenantId, Tenant.CENTRO_CUSTO)
                ? new CentroCustoObrigatorio(centroCustoDao)
                : new CentroCustoNaoUtilizado();

        return new RegrasDoCliente(aprovacao, multa, centroCusto);
    }
}
