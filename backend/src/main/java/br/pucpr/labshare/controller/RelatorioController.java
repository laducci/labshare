/*
 * ============================================================
 *  RelatorioController.java  |  Camada: Controller (API REST)
 *  Responsável na apresentação: Laura, João e Camilla (2 relatórios cada)
 *  Atividade: Medição (6 Saídas Externas - SE)
 * ------------------------------------------------------------
 *  O que faz: rotas GET dos relatórios. O período é opcional
 *  (padrão: 30 dias antes até 30 dias depois de hoje).
 *  Quem chama: tela Relatórios (RelatorioView no React).
 * ============================================================
 */
package br.pucpr.labshare.controller;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dto.Relatorio;
import br.pucpr.labshare.service.RelatorioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioService service;

    public RelatorioController(RelatorioService service) {
        this.service = service;
    }

    /** GET /api/relatorios/utilizacao?inicio=2026-09-01&fim=2026-10-31  (Laura) */
    @GetMapping("/utilizacao")
    public Relatorio utilizacao(@RequestParam(required = false) String inicio, @RequestParam(required = false) String fim, Contexto ctx) {
        return service.utilizacaoPorEquipamento(ctx, inicio(inicio), fim(fim));
    }

    /** GET /api/relatorios/atrasos  (Laura) */
    @GetMapping("/atrasos")
    public Relatorio atrasos(Contexto ctx) {
        return service.reservasEmAtraso(ctx);
    }

    /** GET /api/relatorios/categorias  (João) */
    @GetMapping("/categorias")
    public Relatorio categorias(Contexto ctx) {
        return service.equipamentosPorCategoria(ctx);
    }

    /** GET /api/relatorios/locais  (João) */
    @GetMapping("/locais")
    public Relatorio locais(Contexto ctx) {
        return service.inventarioPorLocal(ctx);
    }

    /** GET /api/relatorios/manutencoes?inicio=...&fim=...  (Camilla) */
    @GetMapping("/manutencoes")
    public Relatorio manutencoes(@RequestParam(required = false) String inicio, @RequestParam(required = false) String fim, Contexto ctx) {
        return service.indicadoresManutencao(ctx, inicio(inicio), fim(fim));
    }

    /** GET /api/relatorios/multas?inicio=...&fim=...  (Camilla; só clientes com lateFee) */
    @GetMapping("/multas")
    public Relatorio multas(@RequestParam(required = false) String inicio, @RequestParam(required = false) String fim, Contexto ctx) {
        return service.multasPorPeriodo(ctx, inicio(inicio), fim(fim));
    }

    private static LocalDate inicio(String valor) {
        return valor == null || valor.isBlank() ? LocalDate.now().minusDays(30) : LocalDate.parse(valor);
    }

    private static LocalDate fim(String valor) {
        return valor == null || valor.isBlank() ? LocalDate.now().plusDays(30) : LocalDate.parse(valor);
    }
}
