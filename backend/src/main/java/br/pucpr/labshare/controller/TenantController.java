/*
 * ============================================================
 *  TenantController.java  |  Camada: Controller (API REST)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (exemplo de variabilidade: tenant_recurso, Personalização, hasFeature)
 * ------------------------------------------------------------
 *  O que faz: expõe /api/tenants. Tenant = cliente do sistema (ex.: universidade, empresa). Lista os
 *  clientes, devolve o cliente do usuário logado (com os recursos ligados) e liga/desliga recursos
 *  (lateFee, approvalRequired, costCenter...) SEM alterar código, gravando na tabela tenant_recurso.
 *  Quem chama: AppContext.jsx (GET /tenants/atual depois do login -> usado no hasFeature e no menu)
 *  e TenantSettings.jsx (tela "Personalização por cliente").
 *  Chama: TenantService -> TenantDao (tabelas tenant e tenant_recurso) + FeatureFlagCache (Singleton).
 * ============================================================
 */
package br.pucpr.labshare.controller;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.model.Tenant;
import br.pucpr.labshare.service.TenantService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/** VARIABILIDADE: consulta e altera os recursos ligados de cada cliente. */
// @RestController: responde HTTP com JSON. @RequestMapping: prefixo /api/tenants.
@RestController
@RequestMapping("/api/tenants")
public class TenantController {

    private final TenantService service;

    // Injeção pelo construtor: o Spring entrega o TenantService (@Service).
    public TenantController(TenantService service) {
        this.service = service;
    }

    // GET /api/tenants -> todos os clientes com seus recursos (tabela da tela TenantSettings).
    @GetMapping
    public List<Tenant> listar() {
        return service.listar();
    }

    /** Cliente do usuário logado (o frontend usa para montar o menu). */
    // GET /api/tenants/atual -> usa o X-Tenant-Id do Contexto. O AppContext guarda o resultado e o
    // hasFeature('lateFee') do React consulta esses recursos para mostrar/esconder telas.
    @GetMapping("/atual")
    public Tenant atual(Contexto ctx) {
        return service.buscar(ctx.tenantId());
    }

    /** PUT /api/tenants/universidade/recursos  { "lateFee": true } */
    // Interruptor da tela TenantSettings. @PathVariable String id = código do cliente; @RequestBody vira um
    // Map recurso -> ligado. O Service grava em tenant_recurso, limpa o FeatureFlagCache e registra no histórico.
    // Recurso com nome desconhecido -> IllegalArgumentException -> HTTP 400.
    @PutMapping("/{id}/recursos")
    public Tenant atualizarRecursos(@PathVariable String id, @RequestBody Map<String, Boolean> recursos, Contexto ctx) {
        return service.atualizarRecursos(id, recursos, ctx);
    }
}
