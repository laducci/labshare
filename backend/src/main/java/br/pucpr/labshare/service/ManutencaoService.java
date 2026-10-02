package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.ManutencaoDao;
import br.pucpr.labshare.model.Equipamento;
import br.pucpr.labshare.model.Manutencao;
import br.pucpr.labshare.model.Ocorrencia;
import br.pucpr.labshare.model.StatusManutencao;
import br.pucpr.labshare.model.StatusOcorrencia;
import br.pucpr.labshare.notificacao.AvisoManutencaoConcluida;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/** Manutenções (RF17, RF18, RF19). Fecha o ciclo: só aqui o equipamento volta a "Disponível" (RN10). */
@Service
public class ManutencaoService extends CrudService<Manutencao> {

    private final ManutencaoDao manutencaoDao;
    private final OcorrenciaService ocorrencias;
    private final EquipamentoService equipamentos;
    private final AvisoManutencaoConcluida avisoConcluida;

    public ManutencaoService(ManutencaoDao dao, OcorrenciaService ocorrencias, EquipamentoService equipamentos,
                             AvisoManutencaoConcluida avisoConcluida, HistoricoService historico, TenantService tenants) {
        super(dao, historico, tenants);
        this.manutencaoDao = dao;
        this.ocorrencias = ocorrencias;
        this.equipamentos = equipamentos;
        this.avisoConcluida = avisoConcluida;
    }

    @Override
    protected String nomeEntidade() {
        return "manutencao";
    }

    @Override
    protected void validar(Manutencao m, Contexto ctx) {
        if (m.getId() == null) {
            obrigatorio(m.getOcorrenciaId(), "Ocorrência");
        }
        exigir(m.getStatus() != StatusManutencao.CONCLUIDA, "Para concluir, use o botão \"Finalizar manutenção\".");
    }

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

    @Override
    protected void depoisDeCriar(Manutencao m, Contexto ctx) {
        Ocorrencia o = ocorrencias.buscar(m.getOcorrenciaId(), ctx);
        o.iniciarAtendimento();
        ocorrencias.salvar(o);
    }

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
    public Manutencao concluir(Long id, Manutencao dados, Contexto ctx) {
        Manutencao m = buscar(id, ctx);
        if (dados != null) {
            if (dados.getDescricaoReparo() != null) m.setDescricaoReparo(dados.getDescricaoReparo());
            if (dados.getPecasSubstituidas() != null) m.setPecasSubstituidas(dados.getPecasSubstituidas());
            if (dados.getResponsavelId() != null) m.setResponsavelId(dados.getResponsavelId());
        }
        m.concluir();
        manutencaoDao.atualizar(m);

        if (m.getOcorrenciaId() != null) {
            Ocorrencia o = ocorrencias.buscar(m.getOcorrenciaId(), ctx);
            o.encerrar();
            ocorrencias.salvar(o);
        }

        Equipamento eq = equipamentos.buscar(m.getEquipamentoId(), ctx);
        eq.liberarAposManutencao(equipamentos.possuiOutrasReservas(eq.getId(), null, ctx));
        equipamentos.salvarStatus(eq);

        historico.registrar(ctx, nomeEntidade(), id, "CONCLUSAO", "Manutenção concluída: " + m.getDescricaoReparo());
        historico.registrar(ctx, "equipamento", eq.getId(), "LIBERACAO", "Equipamento liberado após manutenção");

        Manutencao concluida = buscar(id, ctx);
        avisoConcluida.enviar(concluida, ctx.tenantId());   // Template Method
        return concluida;
    }
}
