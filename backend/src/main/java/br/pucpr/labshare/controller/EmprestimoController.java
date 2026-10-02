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
@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final ProcessoRetirada retirada;
    private final ProcessoDevolucao devolucao;

    public EmprestimoController(ProcessoRetirada retirada, ProcessoDevolucao devolucao) {
        this.retirada = retirada;
        this.devolucao = devolucao;
    }

    /** POST /api/emprestimos/7/retirada  { "itens": [ {"item":"Cabo USB","ok":true}, ... ] } */
    @PostMapping("/{reservaId}/retirada")
    public ResultadoChecklist registrarRetirada(@PathVariable Long reservaId, @RequestBody ChecklistRequest pedido, Contexto ctx) {
        return retirada.executar(reservaId, pedido, ctx);
    }

    /** POST /api/emprestimos/7/devolucao  { "itens": [ {"item":"Sensores","ok":false} ], "observacoes": "..." } */
    @PostMapping("/{reservaId}/devolucao")
    public ResultadoChecklist registrarDevolucao(@PathVariable Long reservaId, @RequestBody ChecklistRequest pedido, Contexto ctx) {
        return devolucao.executar(reservaId, pedido, ctx);
    }
}
