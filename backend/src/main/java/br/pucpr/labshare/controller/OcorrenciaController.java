/*
 * ============================================================
 *  OcorrenciaController.java  |  Camada: Controller (API REST)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (ocorrências com banco), Q3 (reuso via CrudController)
 * ------------------------------------------------------------
 *  O que faz: expõe /api/ocorrencias (defeitos registrados nos equipamentos). O CRUD vem herdado
 *  do CrudController; a rota extra /abertas devolve a fila de ocorrências que a equipe de
 *  manutenção ainda precisa atender. Abrir uma ocorrência manda o equipamento para "Em manutenção" (RN09).
 *  Quem chama: MaintenancePanel e TechnicianPanel (fila), Occurrence (detalhe), CrudPage (config "ocorrencias").
 *  Ocorrências de defeito na devolução são criadas pelo ProcessoDevolucao (RN08), não por esta rota.
 *  Chama: OcorrenciaService -> OcorrenciaDao -> tabela ocorrencia.
 * ============================================================
 */
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
// @RestController: responde HTTP com JSON. @RequestMapping: prefixo /api/ocorrencias.
@RestController
@RequestMapping("/api/ocorrencias")
public class OcorrenciaController extends CrudController<Ocorrencia> {

    private final OcorrenciaService service;

    // Injeção pelo construtor: o Spring entrega o OcorrenciaService (@Service).
    public OcorrenciaController(OcorrenciaService service) {
        this.service = service;
    }

    // Gancho do CrudController: as rotas herdadas usam o OcorrenciaService.
    @Override
    protected CrudService<Ocorrencia> service() {
        return service;
    }

    /** Fila da manutenção: ocorrências ainda não atendidas. */
    // GET /api/ocorrencias/abertas -> usado pelo useApi do MaintenancePanel e do TechnicianPanel.
    // O Spring prefere o caminho fixo "/abertas" ao "/{id}" herdado, por isso não há conflito de rotas.
    @GetMapping("/abertas")
    public List<Ocorrencia> abertas(Contexto ctx) {
        return service.listarAbertas(ctx);
    }
}
