/*
 * ============================================================
 *  NotificacaoService.java  |  Camada: Service (regras de negócio)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (usa Template Method LembreteDevolucao), RN12
 * ------------------------------------------------------------
 *  O que faz: lista as notificações do usuário logado, marca uma como lida e
 *  dispara os lembretes de devolução (RN12) para empréstimos que vencem até amanhã.
 *  Quem chama: NotificacaoController (GET /api/notificacoes/minhas, POST /{id}/lida,
 *              POST /lembretes; telas Notifications, Layout, TechnicianPanel, ActiveLoan).
 *  Chama: NotificacaoDao, ReservaDao, LembreteDevolucao (Template Method).
 * ============================================================
 */
package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.NotificacaoDao;
import br.pucpr.labshare.dao.ReservaDao;
import br.pucpr.labshare.exception.NaoEncontradoException;
import br.pucpr.labshare.model.Notificacao;
import br.pucpr.labshare.model.Reserva;
import br.pucpr.labshare.model.StatusReserva;
import br.pucpr.labshare.notificacao.LembreteDevolucao;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

// @Service: bean do Spring, injetado no NotificacaoController. Não herda de CrudService
// porque notificação não tem cadastro pela tela, só leitura e "marcar como lida".
@Service
public class NotificacaoService {

    private final NotificacaoDao dao;
    private final ReservaDao reservaDao;
    private final LembreteDevolucao lembreteDevolucao;

    // Injeção pelo construtor.
    public NotificacaoService(NotificacaoDao dao, ReservaDao reservaDao, LembreteDevolucao lembreteDevolucao) {
        this.dao = dao;
        this.reservaDao = reservaDao;
        this.lembreteDevolucao = lembreteDevolucao;
    }

    // GET /api/notificacoes/minhas: notificações do usuário logado (tenant + usuário do cabeçalho).
    public List<Notificacao> minhas(Contexto ctx) {
        return dao.listarDoUsuario(ctx.tenantId(), ctx.usuarioId());
    }

    // POST /api/notificacoes/{id}/lida. O filter garante que ninguém marque a notificação de OUTRO usuário (404).
    public Notificacao marcarComoLida(Long id, Contexto ctx) {
        Notificacao n = dao.buscarPorId(id, ctx.tenantId())
                .filter(x -> x.getUsuarioId().equals(ctx.usuarioId()))
                .orElseThrow(() -> new NaoEncontradoException("Notificação", id));
        n.marcarComoLida();
        dao.atualizar(n);
        return n;
    }

    /** RF21 / RN12: lembra quem está com equipamento que vence até amanhã (ou já venceu). */
    // POST /api/notificacoes/lembretes (botão no TechnicianPanel/ActiveLoan). Devolve quantos lembretes saíram.
    public int enviarLembretesDeDevolucao(Contexto ctx) {
        LocalDate amanha = LocalDate.now().plusDays(1);
        int enviados = 0;
        // Percorre só as reservas "Em uso"; "!isAfter(amanha)" = data final hoje, amanhã ou já passada.
        for (Reserva r : reservaDao.listarPorStatus(ctx.tenantId(), StatusReserva.EM_USO)) {
            if (!r.getDataFim().isAfter(amanha)) {
                enviados += lembreteDevolucao.enviar(r, ctx.tenantId());   // Template Method
            }
        }
        return enviados;
    }
}
