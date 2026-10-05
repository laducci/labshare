/*
 * ============================================================
 *  ManutencaoController.java  |  Camada: Controller (API REST)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (CRUD de Manutenções), Q3 (reuso via CrudController)
 * ------------------------------------------------------------
 *  O que faz: expõe /api/manutencoes. O CRUD vem herdado do CrudController (abrir manutenção a
 *  partir de uma ocorrência, editar, excluir) e há 1 rota extra: concluir a manutenção, que
 *  devolve o equipamento para "Disponível" (RN10).
 *  Quem chama: MaintenancePanel (abrir/listar), EquipmentMaintenance (salvar, concluir, excluir),
 *  MaintenanceComplete (tela de confirmação), CrudPage (config "manutencoes").
 *  Chama: ManutencaoService -> ManutencaoDao, OcorrenciaService, EquipamentoService, HistoricoService.
 * ============================================================
 */
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

// @RestController: responde HTTP com JSON. @RequestMapping: prefixo /api/manutencoes (vale também para as rotas herdadas).
@RestController
@RequestMapping("/api/manutencoes")
public class ManutencaoController extends CrudController<Manutencao> {

    private final ManutencaoService service;

    // Injeção pelo construtor: o Spring entrega o ManutencaoService (@Service).
    public ManutencaoController(ManutencaoService service) {
        this.service = service;
    }

    // Gancho do CrudController: as rotas herdadas usam o ManutencaoService.
    // Ex.: botão "Iniciar manutenção" no MaintenancePanel -> POST /api/manutencoes { ocorrenciaId } -> INSERT INTO manutencao.
    @Override
    protected CrudService<Manutencao> service() {
        return service;
    }

    /** POST /api/manutencoes/5/concluir -> equipamento volta a "Disponível" */
    // Botão "Finalizar manutenção" (EquipmentMaintenance). @RequestBody(required = false): pode mandar a descrição
    // do reparo/peças trocadas junto, ou corpo vazio. O Service marca a manutenção como concluída, encerra a
    // ocorrência, libera o equipamento (RN10) e registra tudo no histórico (RN11).
    @PostMapping("/{id}/concluir")
    public Manutencao concluir(@PathVariable Long id, @RequestBody(required = false) Manutencao dados, Contexto ctx) {
        return service.concluir(id, dados, ctx);
    }
}
