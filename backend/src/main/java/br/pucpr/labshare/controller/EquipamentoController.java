package br.pucpr.labshare.controller;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.model.Equipamento;
import br.pucpr.labshare.model.Reserva;
import br.pucpr.labshare.service.CrudService;
import br.pucpr.labshare.service.EquipamentoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/equipamentos")
public class EquipamentoController extends CrudController<Equipamento> {

    private final EquipamentoService service;

    public EquipamentoController(EquipamentoService service) {
        this.service = service;
    }

    @Override
    protected CrudService<Equipamento> service() {
        return service;
    }

    /** GET /api/equipamentos?busca=arduino */
    @GetMapping(params = "busca")
    public List<Equipamento> pesquisar(@RequestParam String busca, Contexto ctx) {
        return service.pesquisar(busca, ctx);
    }

    /** GET /api/equipamentos/1/ocupacao -> períodos já reservados */
    @GetMapping("/{id}/ocupacao")
    public List<Reserva> ocupacao(@PathVariable Long id, Contexto ctx) {
        return service.ocupacao(id, ctx);
    }
}
