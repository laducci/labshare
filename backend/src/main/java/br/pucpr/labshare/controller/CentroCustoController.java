/*
 * ============================================================
 *  CentroCustoController.java  |  Camada: Controller (API REST)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (variabilidade por cliente), Q3 (reuso via CrudController)
 * ------------------------------------------------------------
 *  O que faz: CRUD de centros de custo em /api/centros-custo. É um módulo OPCIONAL: só funciona
 *  para clientes com o recurso "costCenter" ligado (tabela tenant_recurso). Para os demais,
 *  o CentroCustoService bloqueia e o TratadorDeErros responde HTTP 403.
 *  Quem chama: CrudPage.jsx (config "centros-custo") e ConfirmReservation.jsx (select do centro de custo).
 *  Chama: CentroCustoService -> CentroCustoDao -> tabela centro_custo.
 * ============================================================
 */
package br.pucpr.labshare.controller;

import br.pucpr.labshare.model.CentroCusto;
import br.pucpr.labshare.service.CentroCustoService;
import br.pucpr.labshare.service.CrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** CRUD completo de centros de custo (só clientes com costCenter) em /api/centros-custo — todas as rotas vêm do CrudController. */
// @RestController: responde HTTP com JSON. @RequestMapping: prefixo das 5 rotas herdadas.
// Repare que a verificação do recurso NÃO está aqui: fica no Service (recursoNecessario),
// então o controller continua igual aos outros CRUDs.
@RestController
@RequestMapping("/api/centros-custo")
public class CentroCustoController extends CrudController<CentroCusto> {

    private final CentroCustoService service;

    // Injeção pelo construtor: o Spring entrega o CentroCustoService (@Service).
    public CentroCustoController(CentroCustoService service) {
        this.service = service;
    }

    // Gancho do CrudController: informa qual Service atende a entidade CentroCusto.
    @Override
    protected CrudService<CentroCusto> service() {
        return service;
    }
}
