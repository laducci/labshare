/*
 * ============================================================
 *  ManutencaoService.java  |  Camada: Service (regras de negócio)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (CRUD de Manutenções), Q1 (usa Template Method de notificação)
 * ------------------------------------------------------------
 *  O que faz: regras das manutenções (RF17-RF19). A manutenção nasce de uma
 *  ocorrência aberta, coloca a ocorrência "em atendimento" e, ao ser concluída,
 *  encerra a ocorrência e devolve o equipamento a "Disponível" (RN10).
 *  Quem chama: ManutencaoController (/api/manutencoes e POST /api/manutencoes/{id}/concluir;
 *              telas MaintenancePanel, EquipmentMaintenance, MaintenanceComplete).
 *  Chama: ManutencaoDao, OcorrenciaService, EquipamentoService, AvisoManutencaoConcluida, HistoricoService.
 * ============================================================
 */
package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.ManutencaoDao;
import br.pucpr.labshare.model.Equipamento;
import br.pucpr.labshare.model.Manutencao;
import br.pucpr.labshare.model.Ocorrencia;
import br.pucpr.labshare.model.StatusManutencao;
import br.pucpr.labshare.model.StatusOcorrencia;
import br.pucpr.labshare.notificacao.AvisoManutencaoConcluida;
import br.pucpr.labshare.integracao.FornecedorAssistencia;
import br.pucpr.labshare.integracao.SistemaCompras;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/** Manutenções (RF17, RF18, RF19). Fecha o ciclo: só aqui o equipamento volta a "Disponível" (RN10). */
// @Service: bean do Spring, injetado no ManutencaoController.
@Service
public class ManutencaoService extends CrudService<Manutencao> {

    private final ManutencaoDao manutencaoDao;
    private final OcorrenciaService ocorrencias;
    private final EquipamentoService equipamentos;
    private final AvisoManutencaoConcluida avisoConcluida;

    // Injeção pelo construtor: o Spring entrega DAO, outros services e a notificação (Template Method).
    // AIE "Fornecedores de assistência técnica": só leitura, valida o CNPJ escolhido.
    private final SistemaCompras compras;

    public ManutencaoService(ManutencaoDao dao, OcorrenciaService ocorrencias, EquipamentoService equipamentos,
                             AvisoManutencaoConcluida avisoConcluida, HistoricoService historico, TenantService tenants,
                             SistemaCompras compras) {
        super(dao, historico, tenants);
        this.manutencaoDao = dao;
        this.ocorrencias = ocorrencias;
        this.equipamentos = equipamentos;
        this.avisoConcluida = avisoConcluida;
        this.compras = compras;
    }

    // Nome usado no histórico e nas mensagens.
    @Override
    protected String nomeEntidade() {
        return "manutencao";
    }

    // Na criação a ocorrência é obrigatória. Ninguém conclui pelo PUT comum: concluir tem endpoint próprio.
    @Override
    protected void validar(Manutencao m, Contexto ctx) {
        if (m.getId() == null) {
            obrigatorio(m.getOcorrenciaId(), "Ocorrência");
        }
        exigir(m.getStatus() != StatusManutencao.CONCLUIDA, "Para concluir, use o botão \"Finalizar manutenção\".");
        validarFornecedor(m, ctx);
    }

    // Criação (existente == null): copia o equipamento da ocorrência e inicia "Em andamento".
    // Edição: campos do fluxo (equipamento, ocorrência, datas) não podem ser trocados pela tela.
    @Override
    protected void antesDeSalvar(Manutencao m, Manutencao existente, Contexto ctx) {
        if (existente == null) {
            // RF17: a manutenção nasce a partir de uma ocorrência
            Ocorrencia o = ocorrencias.buscar(m.getOcorrenciaId(), ctx);
            exigir(o.getStatus() == StatusOcorrencia.ABERTA, "Esta ocorrência já está em atendimento ou encerrada.");
            m.setEquipamentoId(o.getEquipamentoId());
            m.setStatus(StatusManutencao.EM_ANDAMENTO);
            m.setDataInicio(LocalDate.now());
            m.setDataFim(null);
            if (m.getResponsavelId() == null) m.setResponsavelId(ctx.usuarioId());
        } else {
            exigir(!existente.estaConcluida(), "Uma manutenção concluída não pode ser alterada.");
            m.setEquipamentoId(existente.getEquipamentoId());
            m.setOcorrenciaId(existente.getOcorrenciaId());
            m.setDataInicio(existente.getDataInicio());
            m.setDataFim(null);
            if (m.getStatus() == null) m.setStatus(existente.getStatus());
            if (m.getResponsavelId() == null) m.setResponsavelId(existente.getResponsavelId());
        }
    }

    // Depois do INSERT (botão de iniciar manutenção no MaintenancePanel -> POST /api/manutencoes):
    // a ocorrência sai da fila de "abertas" e passa a "em atendimento".
    @Override
    protected void depoisDeCriar(Manutencao m, Contexto ctx) {
        Ocorrencia o = ocorrencias.buscar(m.getOcorrenciaId(), ctx);
        o.iniciarAtendimento();
        ocorrencias.salvar(o);
    }

    // DELETE /api/manutencoes/{id}: concluídas não podem ser apagadas (histórico, RN11);
    // se for desfeita, a ocorrência volta a ficar ABERTA.
    @Override
    protected void antesDeExcluir(Manutencao existente, Contexto ctx) {
        exigir(!existente.estaConcluida(), "Manutenções concluídas fazem parte do histórico e não podem ser excluídas.");
        if (existente.getOcorrenciaId() != null) {
            Ocorrencia o = ocorrencias.buscar(existente.getOcorrenciaId(), ctx);
            o.setStatus(StatusOcorrencia.ABERTA);   // volta para a fila da manutenção
            ocorrencias.salvar(o);
        }
    }

    /** RF18 + RN10: conclui o reparo, encerra a ocorrência e libera o equipamento. */
    // Botão "Finalizar manutenção" (EquipmentMaintenance) -> POST /api/manutencoes/{id}/concluir.
    public Manutencao concluir(Long id, Manutencao dados, Contexto ctx) {
        Manutencao m = buscar(id, ctx);
        // Copia só os campos que a tela preencheu (descrição do reparo, peças, responsável).
        if (dados != null) {
            if (dados.getDescricaoReparo() != null) m.setDescricaoReparo(dados.getDescricaoReparo());
            if (dados.getPecasSubstituidas() != null) m.setPecasSubstituidas(dados.getPecasSubstituidas());
            if (dados.getResponsavelId() != null) m.setResponsavelId(dados.getResponsavelId());
            if (dados.getFornecedorCnpj() != null) m.setFornecedorCnpj(dados.getFornecedorCnpj());
        }
        validarFornecedor(m, ctx);
        m.concluir();
        manutencaoDao.atualizar(m);

        // Encerra a ocorrência que originou a manutenção.
        if (m.getOcorrenciaId() != null) {
            Ocorrencia o = ocorrencias.buscar(m.getOcorrenciaId(), ctx);
            o.encerrar();
            ocorrencias.salvar(o);
        }

        // RN10: só aqui o equipamento sai de "Em manutenção" (para Disponível, ou Reservado se houver fila).
        Equipamento eq = equipamentos.buscar(m.getEquipamentoId(), ctx);
        eq.liberarAposManutencao(equipamentos.possuiOutrasReservas(eq.getId(), null, ctx));
        equipamentos.salvarStatus(eq);

        // RN11: rastreabilidade da conclusão e da liberação.
        historico.registrar(ctx, nomeEntidade(), id, "CONCLUSAO", "Manutenção concluída: " + m.getDescricaoReparo());
        historico.registrar(ctx, "equipamento", eq.getId(), "LIBERACAO", "Equipamento liberado após manutenção");

        // Notifica técnicos e admins (subclasse do Template Method NotificacaoTemplate).
        Manutencao concluida = buscar(id, ctx);
        avisoConcluida.enviar(concluida, ctx.tenantId());   // Template Method
        return concluida;
    }

    /** Medição (AIE): se a manutenção usa assistência externa, o fornecedor precisa existir e ter contrato vigente. */
    private void validarFornecedor(Manutencao m, Contexto ctx) {
        if (m.getFornecedorCnpj() != null && m.getFornecedorCnpj().isBlank()) m.setFornecedorCnpj(null);
        if (m.getFornecedorCnpj() == null) return;
        FornecedorAssistencia f = compras.buscar(ctx.tenantId(), m.getFornecedorCnpj())
                .orElseThrow(() -> new br.pucpr.labshare.exception.RegraNegocioException(
                        "O fornecedor " + m.getFornecedorCnpj() + " não está cadastrado no Sistema de Compras."));
        exigir(f.contratoVigente(), "O contrato do fornecedor " + f.nomeFantasia() + " não está vigente no Sistema de Compras.");
    }
}
