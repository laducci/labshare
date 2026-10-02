package br.pucpr.labshare.service;

import br.pucpr.labshare.config.ConfiguracaoEmprestimo;
import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.ReservaDao;
import br.pucpr.labshare.model.Equipamento;
import br.pucpr.labshare.model.Reserva;
import br.pucpr.labshare.model.StatusReserva;
import br.pucpr.labshare.model.Tenant;
import br.pucpr.labshare.notificacao.AvisoReservaPendente;
import br.pucpr.labshare.variabilidade.RegrasDoCliente;
import br.pucpr.labshare.variabilidade.SeletorDeRegras;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Reservas (RF07, RF08, RF09). É aqui que a VARIABILIDADE aparece na prática:
 * as estratégias (Strategy) escolhidas pelo SeletorDeRegras decidem o status inicial
 * e se o centro de custo é obrigatório — sem nenhum "if" por cliente.
 */
@Service
public class ReservaService extends CrudService<Reserva> {

    private static final DateTimeFormatter BR = DateTimeFormatter.ofPattern("dd/MM");

    private final ReservaDao reservaDao;
    private final EquipamentoService equipamentos;
    private final SeletorDeRegras seletor;
    private final AvisoReservaPendente avisoReservaPendente;

    public ReservaService(ReservaDao dao, EquipamentoService equipamentos, SeletorDeRegras seletor,
                          AvisoReservaPendente avisoReservaPendente, HistoricoService historico, TenantService tenants) {
        super(dao, historico, tenants);
        this.reservaDao = dao;
        this.equipamentos = equipamentos;
        this.seletor = seletor;
        this.avisoReservaPendente = avisoReservaPendente;
    }

    @Override
    protected String nomeEntidade() {
        return "reserva";
    }

    @Override
    protected void validar(Reserva r, Contexto ctx) {
        obrigatorio(r.getEquipamentoId(), "Equipamento");
        if (r.getUsuarioId() == null) {
            r.setUsuarioId(ctx.usuarioId());     // aluno reservando para si mesmo
        }
        obrigatorio(r.getUsuarioId(), "Usuário");

        // RN03 + prazo máximo lido do Singleton
        r.validarPeriodo(ConfiguracaoEmprestimo.getInstance().getPrazoMaximoDias());

        // RN01 / RN02
        Equipamento eq = equipamentos.buscar(r.getEquipamentoId(), ctx);
        exigir(eq.podeSerReservado(), "O equipamento " + eq.getNome() + " não pode ser reservado agora ("
                + eq.getStatus().getRotulo() + ").");

        // Evita conflito de reserva (problema nº 2 do handoff)
        reservaDao.listarAtivasDoEquipamento(ctx.tenantId(), r.getEquipamentoId()).stream()
                .filter(outra -> !outra.getId().equals(r.getId()))
                .filter(outra -> outra.conflitaCom(r.getDataInicio(), r.getDataFim()))
                .findFirst()
                .ifPresent(outra -> exigir(false, "O equipamento já está reservado de "
                        + outra.getDataInicio().format(BR) + " a " + outra.getDataFim().format(BR) + "."));
    }

    @Override
    protected void antesDeSalvar(Reserva r, Reserva existente, Contexto ctx) {
        RegrasDoCliente regras = seletor.para(ctx.tenantId());

        regras.centroCusto().aplicar(r);                          // STRATEGY: centro de custo

        if (existente == null) {
            r.setStatus(regras.aprovacao().statusInicial());     // STRATEGY: aprovação
        } else {
            exigir(existente.getStatus() == StatusReserva.AGENDADA || existente.getStatus() == StatusReserva.AGUARDANDO_APROVACAO,
                    "Só é possível editar reservas que ainda não foram retiradas.");
            exigir(existente.getEquipamentoId().equals(r.getEquipamentoId()),
                    "Para trocar o equipamento, cancele a reserva e faça uma nova.");
            // campos controlados pelo fluxo não mudam por edição
            r.setStatus(existente.getStatus());
            r.setUsuarioId(existente.getUsuarioId());
            r.setDataRetirada(existente.getDataRetirada());
            r.setDataDevolucao(existente.getDataDevolucao());
        }
    }

    @Override
    protected void depoisDeCriar(Reserva r, Contexto ctx) {
        Equipamento eq = equipamentos.buscar(r.getEquipamentoId(), ctx);
        eq.marcarComoReservado();
        equipamentos.salvarStatus(eq);

        if (r.getStatus() == StatusReserva.AGUARDANDO_APROVACAO) {
            avisoReservaPendente.enviar(buscar(r.getId(), ctx), ctx.tenantId());   // Template Method
        }
    }

    /** DELETE de reserva = cancelar (a reserva continua no histórico). */
    @Override
    public void excluir(Long id, Contexto ctx) {
        cancelar(id, ctx);
    }

    public List<Reserva> listarMinhas(Contexto ctx) {
        return reservaDao.listarDoUsuario(ctx.tenantId(), ctx.usuarioId());
    }

    public List<Reserva> listarPorStatus(Contexto ctx, StatusReserva... status) {
        return reservaDao.listarPorStatus(ctx.tenantId(), status);
    }

    public Reserva cancelar(Long id, Contexto ctx) {
        Reserva r = buscar(id, ctx);
        r.cancelar();
        reservaDao.atualizar(r);
        liberarEquipamentoSeLivre(r, ctx);
        historico.registrar(ctx, nomeEntidade(), id, "CANCELAMENTO", "Reserva cancelada");
        return buscar(id, ctx);
    }

    /** Exclusivo de clientes com approvalRequired (Empresa Corporativa). */
    public Reserva aprovar(Long id, Contexto ctx) {
        tenants.exigirRecurso(ctx.tenantId(), Tenant.APROVACAO_GESTOR);
        Reserva r = buscar(id, ctx);
        r.aprovar();
        reservaDao.atualizar(r);
        historico.registrar(ctx, nomeEntidade(), id, "APROVACAO", "Reserva aprovada pelo gestor");
        return buscar(id, ctx);
    }

    public Reserva rejeitar(Long id, String motivo, Contexto ctx) {
        tenants.exigirRecurso(ctx.tenantId(), Tenant.APROVACAO_GESTOR);
        Reserva r = buscar(id, ctx);
        r.rejeitar();
        r.setObservacoes(motivo);
        reservaDao.atualizar(r);
        liberarEquipamentoSeLivre(r, ctx);
        historico.registrar(ctx, nomeEntidade(), id, "REJEICAO", "Reserva rejeitada" + (motivo == null ? "" : ": " + motivo));
        return buscar(id, ctx);
    }

    /** O que o cliente logado exige na reserva (mostrado na tela "Confirmar reserva"). */
    public Map<String, Object> regrasDoCliente(Contexto ctx) {
        RegrasDoCliente regras = seletor.para(ctx.tenantId());
        ConfiguracaoEmprestimo config = ConfiguracaoEmprestimo.getInstance();
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("exigeAprovacao", regras.aprovacao().exigeAprovacao());
        info.put("aprovacao", regras.aprovacao().descricao());
        info.put("multa", regras.multa().descricao());
        info.put("exigeCentroCusto", tenants.possuiRecurso(ctx.tenantId(), Tenant.CENTRO_CUSTO));
        info.put("prazoMaximoDias", config.getPrazoMaximoDias());
        info.put("regras", config.getRegras());
        return info;
    }

    private void liberarEquipamentoSeLivre(Reserva r, Contexto ctx) {
        Equipamento eq = equipamentos.buscar(r.getEquipamentoId(), ctx);
        if (eq.getStatus() == br.pucpr.labshare.model.StatusEquipamento.RESERVADO) {
            eq.liberar(equipamentos.possuiOutrasReservas(eq.getId(), r.getId(), ctx));
            equipamentos.salvarStatus(eq);
        }
    }
}
