/*
 * ============================================================
 *  LocalController.java  |  Camada: Controller (API REST)
 *  Responsável na apresentação: João  |  Atividade: Q2 (CRUD de Locais), Q3 (reuso via CrudController)
 * ------------------------------------------------------------
 *  O que faz: expõe o CRUD de locais (laboratórios/salas onde ficam os equipamentos) em
 *  /api/locais. Não tem método próprio: as 5 rotas vêm herdadas do CrudController.
 *  Quem chama: CrudPage.jsx (config "locais" em crudConfigs.jsx) e EquipmentForm/EquipmentList
 *  (select de locais).
 *  Chama: LocalService -> LocalDao -> tabela local.
 * ============================================================
 */
package br.pucpr.labshare.controller;

import br.pucpr.labshare.model.Local;
import br.pucpr.labshare.service.LocalService;
import br.pucpr.labshare.service.CrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** CRUD completo de locais em /api/locais — todas as rotas vêm do CrudController. */
// @RestController: responde HTTP com JSON. @RequestMapping: prefixo /api/locais para as rotas herdadas.
@RestController
@RequestMapping("/api/locais")
public class LocalController extends CrudController<Local> {

    private final LocalService service;

    // Injeção pelo construtor: o Spring entrega o LocalService (@Service) já pronto.
    public LocalController(LocalService service) {
        this.service = service;
    }

    // Gancho do CrudController: informa qual Service atende a entidade Local.
    @Override
    protected CrudService<Local> service() {
        return service;
    }
}
