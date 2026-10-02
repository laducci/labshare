package br.pucpr.labshare.controller;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.model.Manutencao;
import br.pucpr.labshare.service.CrudService;
import br.pucpr.labshare.service.ManutencaoService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/manutencoes")
public class ManutencaoController extends CrudController<Manutencao> {

    private final ManutencaoService service;

    public ManutencaoController(ManutencaoService service) {
        this.service = service;
    }

    @Override
    protected CrudService<Manutencao> service() {
        return service;
    }

    /** POST /api/manutencoes/5/concluir -> equipamento volta a "Disponível" */
    @PostMapping("/{id}/concluir")
    public Manutencao concluir(@PathVariable Long id, @RequestBody(required = false) Manutencao dados, Contexto ctx) {
        return service.concluir(id, dados, ctx);
    }
}
