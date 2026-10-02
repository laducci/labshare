package br.pucpr.labshare.controller;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.model.Ocorrencia;
import br.pucpr.labshare.service.OcorrenciaService;
import br.pucpr.labshare.service.CrudService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** CRUD completo de ocorrências em /api/ocorrencias — todas as rotas vêm do CrudController. */
@RestController
@RequestMapping("/api/ocorrencias")
public class OcorrenciaController extends CrudController<Ocorrencia> {

    private final OcorrenciaService service;

    public OcorrenciaController(OcorrenciaService service) {
        this.service = service;
    }

    @Override
    protected CrudService<Ocorrencia> service() {
        return service;
    }

    /** Fila da manutenção: ocorrências ainda não atendidas. */
    @GetMapping("/abertas")
    public List<Ocorrencia> abertas(Contexto ctx) {
        return service.listarAbertas(ctx);
    }
}
