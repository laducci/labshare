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
@RestController
@RequestMapping("/api")
public class ConsultaController {

    private final HistoricoService historico;
    private final RelatorioDao relatorioDao;

    public ConsultaController(HistoricoService historico, RelatorioDao relatorioDao) {
        this.historico = historico;
        this.relatorioDao = relatorioDao;
    }

    /** GET /api/historico?entidade=equipamento&entidadeId=1  (RF25) */
    @GetMapping("/historico")
    public List<Historico> historico(@RequestParam(required = false) String entidade,
                                     @RequestParam(required = false) Long entidadeId, Contexto ctx) {
        return historico.listar(ctx, entidade, entidadeId);
    }

    /** GET /api/configuracoes/emprestimo -> dados lidos UMA vez pelo Singleton */
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
