/*
 * ============================================================
 *  HistoricoService.java  |  Camada: Service (regras de negócio)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (tabela historico), RN11 / RNF10
 * ------------------------------------------------------------
 *  O que faz: ponto único de rastreabilidade. Toda ação importante (criar,
 *  editar, desativar, retirada, devolução, aprovação...) grava uma linha na
 *  tabela historico com cliente, entidade, ação, descrição e usuário.
 *  Quem chama: CrudService (todas as entidades), ProcessoChecklist,
 *              ReservaService, ManutencaoService, TenantService, ConsultaController.
 *  Chama: HistoricoDao (INSERT/SELECT na tabela historico).
 * ============================================================
 */
package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.HistoricoDao;
import br.pucpr.labshare.model.Historico;
import org.springframework.stereotype.Service;

import java.util.List;

/** Rastreabilidade: um único ponto para registrar "quem fez o quê" (RNF10 / RN11). */
// @Service: bean do Spring; é injetado em praticamente todos os outros services.
@Service
public class HistoricoService {

    private final HistoricoDao dao;

    // Injeção pelo construtor.
    public HistoricoService(HistoricoDao dao) {
        this.dao = dao;
    }

    // Grava um registro de histórico. O Contexto traz tenantId e usuarioId (cabeçalhos X-Tenant-Id / X-Usuario-Id).
    public void registrar(Contexto ctx, String entidade, Long entidadeId, String acao, String descricao) {
        dao.registrar(new Historico(ctx.tenantId(), entidade, entidadeId, acao, descricao, ctx.usuarioId()));
    }

    // Lista o histórico de um registro específico (GET /api/historico), só do cliente logado.
    public List<Historico> listar(Contexto ctx, String entidade, Long entidadeId) {
        return dao.listar(ctx.tenantId(), entidade, entidadeId);
    }
}
