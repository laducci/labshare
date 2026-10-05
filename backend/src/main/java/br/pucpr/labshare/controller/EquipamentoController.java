/*
 * ============================================================
 *  EquipamentoController.java  |  Camada: Controller (API REST)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Equipamentos), Q3 (reuso via CrudController)
 * ------------------------------------------------------------
 *  O que faz: expõe /api/equipamentos. As 5 rotas do CRUD vêm herdadas do CrudController
 *  (cadastrar, listar, ver, editar, desativar) e aqui só existem 2 rotas extras:
 *  pesquisa por texto e a "ocupação" (períodos já reservados de um equipamento).
 *  Quem chama: EquipmentList, EquipmentForm (CreateEquipment/EditEquipment), EquipmentDetails,
 *  SearchResults (busca), Availability (ocupação), ConfirmReservation.
 *  Chama: EquipamentoService -> EquipamentoDao / ReservaDao -> tabelas equipamento e reserva.
 * ============================================================
 */
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

// @RestController: a classe responde HTTP e o retorno vira JSON (Jackson).
// @RequestMapping("/api/equipamentos"): prefixo de todas as rotas, inclusive as herdadas do CrudController.
// "extends CrudController<Equipamento>": ganha GET/POST/PUT/DELETE prontos (reuso, Q3).
@RestController
@RequestMapping("/api/equipamentos")
public class EquipamentoController extends CrudController<Equipamento> {

    private final EquipamentoService service;

    // Injeção de dependência pelo construtor: o Spring cria o EquipamentoService (@Service) e passa aqui.
    public EquipamentoController(EquipamentoService service) {
        this.service = service;
    }

    // Gancho do CrudController: diz qual Service as rotas herdadas devem usar.
    @Override
    protected CrudService<Equipamento> service() {
        return service;
    }

    /** GET /api/equipamentos?busca=arduino */
    // Barra de busca -> tela SearchResults. "params = busca" faz o Spring escolher ESTE método só quando
    // a URL tem ?busca=...; sem o parâmetro, cai no listar() herdado. @RequestParam lê o valor da query string.
    // No DAO vira um SELECT com "nome ILIKE ? OR categoria ILIKE ? OR patrimonio ILIKE ?" (os "?" são
    // preenchidos pelo PreparedStatement, evitando SQL Injection), sempre filtrado pelo tenant_id do cliente.
    @GetMapping(params = "busca")
    public List<Equipamento> pesquisar(@RequestParam String busca, Contexto ctx) {
        return service.pesquisar(busca, ctx);
    }

    /** GET /api/equipamentos/1/ocupacao -> períodos já reservados */
    // Tela "Disponibilidade" (Availability.jsx): mostra as datas já ocupadas para o aluno escolher
    // um período livre antes de reservar (apoia RN02/RN03). @PathVariable pega o {id} da URL.
    @GetMapping("/{id}/ocupacao")
    public List<Reserva> ocupacao(@PathVariable Long id, Contexto ctx) {
        return service.ocupacao(id, ctx);
    }
}
