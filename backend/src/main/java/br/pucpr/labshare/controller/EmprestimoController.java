/*
 * ============================================================
 *  EmprestimoController.java  |  Camada: Controller (API REST)
 *  Responsável na apresentação: Laura  |  Atividade: Q1 (Template Method ProcessoChecklist), Q3 (reuso do Checklist)
 * ------------------------------------------------------------
 *  O que faz: registra a RETIRADA e a DEVOLUÇÃO de um equipamento reservado. Os dois endpoints
 *  usam o mesmo método-template ProcessoChecklist.executar(); muda só a subclasse
 *  (ProcessoRetirada ou ProcessoDevolucao), que implementa os passos específicos.
 *  Quem chama: RegisterPickup.jsx (botão "Confirmar retirada") e RegisterReturn.jsx
 *  (botão "Confirmar devolução"), ambos usando o componente Checklist.
 *  Chama: ProcessoRetirada / ProcessoDevolucao -> ReservaDao, EquipamentoService, HistoricoService.
 * ============================================================
 */
package br.pucpr.labshare.controller;

import br.pucpr.labshare.checklist.ProcessoDevolucao;
import br.pucpr.labshare.checklist.ProcessoRetirada;
import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dto.ChecklistRequest;
import br.pucpr.labshare.dto.ResultadoChecklist;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Retirada e devolução. Os dois endpoints chamam o MESMO método-template
 * (ProcessoChecklist.executar), cada um com sua subclasse.
 */
// @RestController: responde HTTP com JSON. @RequestMapping: prefixo /api/emprestimos.
// Não estende CrudController porque retirada/devolução não são um cadastro: são etapas do fluxo da reserva.
@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final ProcessoRetirada retirada;
    private final ProcessoDevolucao devolucao;

    // Injeção pelo construtor: as duas subclasses do Template Method são @Component, então o Spring
    // cria uma instância de cada e entrega aqui.
    public EmprestimoController(ProcessoRetirada retirada, ProcessoDevolucao devolucao) {
        this.retirada = retirada;
        this.devolucao = devolucao;
    }

    /** POST /api/emprestimos/7/retirada  { "itens": [ {"item":"Cabo USB","ok":true}, ... ] } */
    // Tela RegisterPickup -> botão "Confirmar retirada". @PathVariable = id da reserva; @RequestBody = itens do checklist.
    // Regras aplicadas pela ProcessoRetirada: RN04 (só reserva válida), RN05 (todos os itens conferidos)
    // e RN06 (reserva e equipamento passam para "Em uso"). Tudo fica registrado no histórico (RN11).
    @PostMapping("/{reservaId}/retirada")
    public ResultadoChecklist registrarRetirada(@PathVariable Long reservaId, @RequestBody ChecklistRequest pedido, Contexto ctx) {
        return retirada.executar(reservaId, pedido, ctx);
    }

    /** POST /api/emprestimos/7/devolucao  { "itens": [ {"item":"Sensores","ok":false} ], "observacoes": "..." } */
    // Tela RegisterReturn -> botão "Confirmar devolução". Regras da ProcessoDevolucao: RN07 (inspeção obrigatória),
    // RN08 (item com defeito gera ocorrência) e RN09 (ocorrência manda o equipamento para "Em manutenção").
    @PostMapping("/{reservaId}/devolucao")
    public ResultadoChecklist registrarDevolucao(@PathVariable Long reservaId, @RequestBody ChecklistRequest pedido, Contexto ctx) {
        return devolucao.executar(reservaId, pedido, ctx);
    }
}
