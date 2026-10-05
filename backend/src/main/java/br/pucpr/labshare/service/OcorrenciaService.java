/*
 * ============================================================
 *  OcorrenciaService.java  |  Camada: Service (regras de negócio)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (ocorrências), RN08 / RN09
 * ------------------------------------------------------------
 *  O que faz: regras das ocorrências (RF16) - registros de defeito de um
 *  equipamento. Criar uma ocorrência tira o equipamento de circulação
 *  ("Em manutenção", RN09); excluir uma aberta por engano devolve o equipamento.
 *  Quem chama: OcorrenciaController (/api/ocorrencias, GET /abertas; telas Occurrence,
 *              MaintenancePanel, TechnicianPanel) e ManutencaoService.
 *  Chama: OcorrenciaDao, EquipamentoService, HistoricoService (via CrudService).
 * ============================================================
 */
package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.OcorrenciaDao;
import br.pucpr.labshare.model.Equipamento;
import br.pucpr.labshare.model.Ocorrencia;
import br.pucpr.labshare.model.StatusEquipamento;
import br.pucpr.labshare.model.StatusOcorrencia;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/** Ocorrências (RF16). Criar uma ocorrência tira o equipamento de circulação (RN09). */
// @Service: bean do Spring, injetado no OcorrenciaController e no ManutencaoService.
@Service
public class OcorrenciaService extends CrudService<Ocorrencia> {

    // Valores aceitos para a prioridade (Set.of cria um conjunto imutável).
    private static final Set<String> PRIORIDADES = Set.of("Baixa", "Média", "Alta");

    private final OcorrenciaDao ocorrenciaDao;
    private final EquipamentoService equipamentos;

    // Injeção pelo construtor; o dao também vai para o CrudService (super).
    public OcorrenciaService(OcorrenciaDao dao, EquipamentoService equipamentos, HistoricoService historico, TenantService tenants) {
        super(dao, historico, tenants);
        this.ocorrenciaDao = dao;
        this.equipamentos = equipamentos;
    }

    // Nome usado no histórico e nas mensagens.
    @Override
    protected String nomeEntidade() {
        return "ocorrencia";
    }

    // Equipamento e descrição obrigatórios; prioridade padrão "Média" e só aceita Baixa/Média/Alta.
    @Override
    protected void validar(Ocorrencia o, Contexto ctx) {
        obrigatorio(o.getEquipamentoId(), "Equipamento");
        obrigatorio(o.getDescricao(), "Descrição");
        if (o.getPrioridade() == null || o.getPrioridade().isBlank()) o.setPrioridade("Média");
        exigir(PRIORIDADES.contains(o.getPrioridade()), "Prioridade deve ser Baixa, Média ou Alta.");
    }

    // Criação: não aceita equipamento "Em uso" (nesse caso o defeito é registrado na devolução, RN08)
    // e a ocorrência nasce ABERTA com a data de hoje. Edição: campos do fluxo não mudam.
    @Override
    protected void antesDeSalvar(Ocorrencia o, Ocorrencia existente, Contexto ctx) {
        if (existente == null) {
            Equipamento eq = equipamentos.buscar(o.getEquipamentoId(), ctx);
            exigir(eq.getStatus() != StatusEquipamento.EM_USO,
                    "Este equipamento está em uso: registre o defeito na devolução.");
            o.setStatus(StatusOcorrencia.ABERTA);
            o.setDataAbertura(LocalDate.now());
        } else {
            o.setStatus(existente.getStatus());
            o.setEquipamentoId(existente.getEquipamentoId());
            o.setReservaId(existente.getReservaId());
            o.setDataAbertura(existente.getDataAbertura());
        }
    }

    /** RN09: ocorrência aberta -> equipamento "Em manutenção". */
    @Override
    protected void depoisDeCriar(Ocorrencia o, Contexto ctx) {
        Equipamento eq = equipamentos.buscar(o.getEquipamentoId(), ctx);
        eq.enviarParaManutencao();
        equipamentos.salvarStatus(eq);
    }

    /** Ocorrência aberta por engano: remove e devolve o equipamento para circulação. */
    // Só pode excluir enquanto ABERTA (antes de virar manutenção).
    @Override
    protected void antesDeExcluir(Ocorrencia existente, Contexto ctx) {
        exigir(existente.getStatus() == StatusOcorrencia.ABERTA,
                "Só é possível excluir ocorrências que ainda não entraram em manutenção.");
        Equipamento eq = equipamentos.buscar(existente.getEquipamentoId(), ctx);
        if (eq.getStatus() == StatusEquipamento.EM_MANUTENCAO) {
            eq.liberarAposManutencao(equipamentos.possuiOutrasReservas(eq.getId(), null, ctx));
            equipamentos.salvarStatus(eq);
        }
    }

    // GET /api/ocorrencias/abertas: fila de defeitos esperando manutenção (MaintenancePanel/TechnicianPanel).
    public List<Ocorrencia> listarAbertas(Contexto ctx) {
        return ocorrenciaDao.listarAbertas(ctx.tenantId());
    }

    // Grava mudança de status feita pelo ManutencaoService (UPDATE direto, sem validações do CRUD).
    public void salvar(Ocorrencia o) {
        ocorrenciaDao.atualizar(o);
    }
}
