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
@RestController
@RequestMapping("/api/tenants")
public class TenantController {

    private final TenantService service;

    public TenantController(TenantService service) {
        this.service = service;
    }

    @GetMapping
    public List<Tenant> listar() {
        return service.listar();
    }

    /** Cliente do usuário logado (o frontend usa para montar o menu). */
    @GetMapping("/atual")
    public Tenant atual(Contexto ctx) {
        return service.buscar(ctx.tenantId());
    }

    /** PUT /api/tenants/universidade/recursos  { "lateFee": true } */
    @PutMapping("/{id}/recursos")
    public Tenant atualizarRecursos(@PathVariable String id, @RequestBody Map<String, Boolean> recursos, Contexto ctx) {
        return service.atualizarRecursos(id, recursos, ctx);
    }
}
