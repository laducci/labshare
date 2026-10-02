package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.EquipamentoDao;
import br.pucpr.labshare.dao.ReservaDao;
import br.pucpr.labshare.model.Equipamento;
import br.pucpr.labshare.model.Reserva;
import br.pucpr.labshare.model.StatusEquipamento;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipamentoService extends CrudService<Equipamento> {

    private final EquipamentoDao equipamentoDao;
    private final ReservaDao reservaDao;

    public EquipamentoService(EquipamentoDao dao, ReservaDao reservaDao, HistoricoService historico, TenantService tenants) {
        super(dao, historico, tenants);
        this.equipamentoDao = dao;
        this.reservaDao = reservaDao;
    }

    @Override
    protected String nomeEntidade() {
        return "equipamento";
    }

    @Override
    protected void validar(Equipamento e, Contexto ctx) {
        obrigatorio(e.getNome(), "Nome");
        obrigatorio(e.getCategoriaId(), "Categoria");
    }

    /**
     * O admin só escolhe entre "Disponível" e "Indisponível" (bloqueio administrativo).
     * Os demais status (Reservado, Em uso, Em manutenção) são controlados pelo fluxo.
     */
    @Override
    protected void antesDeSalvar(Equipamento e, Equipamento existente, Contexto ctx) {
        boolean statusManualValido = e.getStatus() == StatusEquipamento.DISPONIVEL
                || e.getStatus() == StatusEquipamento.INDISPONIVEL;

        if (existente != null && existente.statusControladoPeloFluxo()) {
            e.setStatus(existente.getStatus());
        } else if (!statusManualValido) {
            e.setStatus(existente == null ? StatusEquipamento.DISPONIVEL : existente.getStatus());
        }
        if (e.getItensChecklist().isEmpty()) {
            e.setItensChecklist(e.getItensInclusos());   // checklist padrão = itens inclusos
        }
    }

    @Override
    protected void antesDeExcluir(Equipamento existente, Contexto ctx) {
        exigir(existente.getStatus() != StatusEquipamento.EM_USO,
                "Não é possível desativar um equipamento que está em uso.");
        exigir(reservaDao.listarAtivasDoEquipamento(ctx.tenantId(), existente.getId()).isEmpty(),
                "Cancele as reservas ativas deste equipamento antes de desativá-lo.");
    }

    public List<Equipamento> pesquisar(String texto, Contexto ctx) {
        if (texto == null || texto.isBlank()) return listar(ctx);
        return equipamentoDao.pesquisar(ctx.tenantId(), texto);
    }

    /** Períodos já ocupados (tela "Disponibilidade"). */
    public List<Reserva> ocupacao(Long equipamentoId, Contexto ctx) {
        buscar(equipamentoId, ctx);
        return reservaDao.listarAtivasDoEquipamento(ctx.tenantId(), equipamentoId);
    }

    /** Usado no fluxo: retirada, devolução, manutenção. */
    public void salvarStatus(Equipamento e) {
        equipamentoDao.atualizarStatus(e);
    }

    /** Existe alguma reserva ativa além desta? (decide se volta a "Disponível" ou "Reservado") */
    public boolean possuiOutrasReservas(Long equipamentoId, Long reservaIgnorada, Contexto ctx) {
        return reservaDao.listarAtivasDoEquipamento(ctx.tenantId(), equipamentoId).stream()
                .anyMatch(r -> !r.getId().equals(reservaIgnorada));
    }
}
