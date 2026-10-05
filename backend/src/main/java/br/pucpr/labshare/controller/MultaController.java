/*
 * ============================================================
 *  MultaController.java  |  Camada: Controller (API REST)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (variabilidade "lateFee"), Q1 (Strategy CalculoMulta via Service), Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: CRUD de multas por atraso em /api/multas (herdado do CrudController) + rota para
 *  registrar o pagamento. Módulo OPCIONAL: só existe para clientes com o recurso "lateFee" ligado.
 *  O valor da multa é calculado pela estratégia do cliente (Strategy CalculoMulta) no MultaService.
 *  Quem chama: LateFeePanel -> CrudPage (config "multas" em crudConfigs.jsx, botão "Marcar como paga").
 *  A multa em si é gerada automaticamente na devolução em atraso (ProcessoDevolucao), não por esta rota.
 *  Chama: MultaService -> MultaDao -> tabela multa.
 * ============================================================
 */
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
// O bloqueio acontece no MultaService (recursoNecessario = lateFee) -> AcessoNegadoException
// -> TratadorDeErros -> HTTP 403. O controller em si é igual aos outros.
// @RestController: responde HTTP com JSON. @RequestMapping: prefixo /api/multas.
@RestController
@RequestMapping("/api/multas")
public class MultaController extends CrudController<Multa> {

    private final MultaService service;

    // Injeção pelo construtor: o Spring entrega o MultaService (@Service).
    public MultaController(MultaService service) {
        this.service = service;
    }

    // Gancho do CrudController: as rotas herdadas usam o MultaService.
    @Override
    protected CrudService<Multa> service() {
        return service;
    }

    // Botão "Marcar como paga" (CrudPage de multas) -> POST /api/multas/{id}/pagar.
    // Marca a multa como paga (UPDATE na tabela multa) e grava no histórico.
    @PostMapping("/{id}/pagar")
    public Multa pagar(@PathVariable Long id, Contexto ctx) {
        return service.registrarPagamento(id, ctx);
    }
}
