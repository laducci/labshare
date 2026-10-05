/*
 * ============================================================
 *  ConsultaController.java  |  Camada: Controller (API REST somente leitura)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (usa o Singleton ConfiguracaoEmprestimo), Q2 (dashboard/histórico)
 * ------------------------------------------------------------
 *  O que faz: junta rotas que só CONSULTAM dados (nenhuma grava nada): histórico de ações (RN11/RNF10),
 *  configurações de empréstimo (lidas do Singleton) e o resumo numérico do Dashboard.
 *  Quem chama: EquipmentDetails (histórico do equipamento), Dashboard (/relatorios/resumo).
 *  Chama: HistoricoService, ConfiguracaoEmprestimo.getInstance() e RelatorioDao (SELECT ... GROUP BY).
 * ============================================================
 */
package br.pucpr.labshare.controller;

import br.pucpr.labshare.config.ConfiguracaoEmprestimo;
import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.RelatorioDao;
import br.pucpr.labshare.model.Historico;
import br.pucpr.labshare.service.HistoricoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Rotas só de leitura: histórico, configurações (Singleton) e indicadores do dashboard. */
// @RestController: responde HTTP com JSON. @RequestMapping("/api"): prefixo genérico, porque cada
// método aqui atende um recurso diferente (/historico, /configuracoes, /relatorios).
@RestController
@RequestMapping("/api")
public class ConsultaController {

    private final HistoricoService historico;
    private final RelatorioDao relatorioDao;

    // Injeção pelo construtor: o Spring entrega o HistoricoService (@Service) e o RelatorioDao (@Repository).
    public ConsultaController(HistoricoService historico, RelatorioDao relatorioDao) {
        this.historico = historico;
        this.relatorioDao = relatorioDao;
    }

    /** GET /api/historico?entidade=equipamento&entidadeId=1  (RF25) */
    // Tela EquipmentDetails (só para a equipe) mostra a linha do tempo do equipamento.
    // @RequestParam(required = false): os dois filtros são opcionais; sem eles vem o histórico geral do cliente.
    @GetMapping("/historico")
    public List<Historico> historico(@RequestParam(required = false) String entidade,
                                     @RequestParam(required = false) Long entidadeId, Contexto ctx) {
        return historico.listar(ctx, entidade, entidadeId);
    }

    /** GET /api/configuracoes/emprestimo -> dados lidos UMA vez pelo Singleton */
    // SINGLETON: getInstance() devolve sempre o MESMO objeto ConfiguracaoEmprestimo, que leu o arquivo
    // de configuração uma única vez. Não usa Contexto porque essas regras valem para todos os clientes.
    // LinkedHashMap mantém a ordem de inserção das chaves no JSON.
    @GetMapping("/configuracoes/emprestimo")
    public Map<String, Object> configuracoes() {
        ConfiguracaoEmprestimo c = ConfiguracaoEmprestimo.getInstance();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("prazoMaximoDias", c.getPrazoMaximoDias());
        m.put("valorMultaDiaria", c.getValorMultaDiaria());
        m.put("horarioDevolucao", c.getHorarioDevolucao());
        m.put("regras", c.getRegras());
        return m;
    }

    /** GET /api/relatorios/resumo -> contagens para o dashboard (Medição de Software) */
    // Tela Dashboard. Cada contarPorStatus faz "SELECT status, COUNT(*) ... WHERE tenant_id = ? AND ativo = TRUE
    // GROUP BY status" na tabela indicada; maisReservados traz o top 5 de equipamentos com mais reservas.
    // Tudo filtrado pelo tenant_id do usuário logado (cada cliente só vê os próprios números).
    @GetMapping("/relatorios/resumo")
    public Map<String, Object> resumo(Contexto ctx) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("equipamentos", relatorioDao.contarPorStatus("equipamento", ctx.tenantId()));
        m.put("reservas", relatorioDao.contarPorStatus("reserva", ctx.tenantId()));
        m.put("ocorrencias", relatorioDao.contarPorStatus("ocorrencia", ctx.tenantId()));
        m.put("manutencoes", relatorioDao.contarPorStatus("manutencao", ctx.tenantId()));
        m.put("maisReservados", relatorioDao.equipamentosMaisReservados(ctx.tenantId()));
        return m;
    }
}
