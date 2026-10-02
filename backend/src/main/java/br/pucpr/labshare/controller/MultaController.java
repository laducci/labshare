package br.pucpr.labshare.controller;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.model.Multa;
import br.pucpr.labshare.service.CrudService;
import br.pucpr.labshare.service.MultaService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** VARIABILIDADE: para clientes sem "lateFee", qualquer rota daqui responde 403. */
@RestController
@RequestMapping("/api/multas")
public class MultaController extends CrudController<Multa> {

    private final MultaService service;

    public MultaController(MultaService service) {
        this.service = service;
    }

    @Override
    protected CrudService<Multa> service() {
        return service;
    }

    @PostMapping("/{id}/pagar")
    public Multa pagar(@PathVariable Long id, Contexto ctx) {
        return service.registrarPagamento(id, ctx);
    }
}
