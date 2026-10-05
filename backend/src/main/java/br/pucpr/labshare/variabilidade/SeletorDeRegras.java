/*
 * ============================================================
 *  SeletorDeRegras.java  |  Camada: Variabilidade (quem escolhe a Strategy)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Strategy - escolha), Q2 (exemplo de variabilidade)
 * ------------------------------------------------------------
 *  O que faz: para um cliente (tenantId), consulta quais recursos estão ligados
 *  (tabela tenant_recurso, via TenantService + cache Singleton FeatureFlagCache)
 *  e monta as três estratégias certas dentro de um RegrasDoCliente.
 *  Quem chama: ReservaService, MultaService, ProcessoDevolucao.
 *  Chama: TenantService.possuiRecurso; repassa CentroCustoDao à estratégia.
 * ============================================================
 */
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
// @Component: o Spring cria UMA instância desta classe (bean) e a injeta em quem pedir no construtor.
@Component
public class SeletorDeRegras {

    private final TenantService tenants;
    private final CentroCustoDao centroCustoDao;

    // Injeção de dependência pelo construtor: o Spring entrega TenantService e CentroCustoDao prontos.
    public SeletorDeRegras(TenantService tenants, CentroCustoDao centroCustoDao) {
        this.tenants = tenants;
        this.centroCustoDao = centroCustoDao;
    }

    // Devolve as estratégias do cliente. Ligar/desligar um recurso na tela "Personalização"
    // (PUT /api/tenants/{id}/recursos) muda o resultado daqui SEM alterar código.
    public RegrasDoCliente para(String tenantId) {
        // Operador ternário (condição ? A : B) escolhe qual classe concreta instanciar.
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
