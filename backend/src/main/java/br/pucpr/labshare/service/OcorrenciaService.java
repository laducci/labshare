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
@Service
public class OcorrenciaService extends CrudService<Ocorrencia> {

    private static final Set<String> PRIORIDADES = Set.of("Baixa", "Média", "Alta");

    private final OcorrenciaDao ocorrenciaDao;
    private final EquipamentoService equipamentos;

    public OcorrenciaService(OcorrenciaDao dao, EquipamentoService equipamentos, HistoricoService historico, TenantService tenants) {
        super(dao, historico, tenants);
        this.ocorrenciaDao = dao;
        this.equipamentos = equipamentos;
    }

    @Override
    protected String nomeEntidade() {
        return "ocorrencia";
    }

    @Override
    protected void validar(Ocorrencia o, Contexto ctx) {
        obrigatorio(o.getEquipamentoId(), "Equipamento");
        obrigatorio(o.getDescricao(), "Descrição");
        if (o.getPrioridade() == null || o.getPrioridade().isBlank()) o.setPrioridade("Média");
        exigir(PRIORIDADES.contains(o.getPrioridade()), "Prioridade deve ser Baixa, Média ou Alta.");
    }

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

    public List<Ocorrencia> listarAbertas(Contexto ctx) {
        return ocorrenciaDao.listarAbertas(ctx.tenantId());
    }

    public void salvar(Ocorrencia o) {
        ocorrenciaDao.atualizar(o);
    }
}
