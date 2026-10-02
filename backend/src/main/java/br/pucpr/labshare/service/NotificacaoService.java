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

@Service
public class NotificacaoService {

    private final NotificacaoDao dao;
    private final ReservaDao reservaDao;
    private final LembreteDevolucao lembreteDevolucao;

    public NotificacaoService(NotificacaoDao dao, ReservaDao reservaDao, LembreteDevolucao lembreteDevolucao) {
        this.dao = dao;
        this.reservaDao = reservaDao;
        this.lembreteDevolucao = lembreteDevolucao;
    }

    public List<Notificacao> minhas(Contexto ctx) {
        return dao.listarDoUsuario(ctx.tenantId(), ctx.usuarioId());
    }

    public Notificacao marcarComoLida(Long id, Contexto ctx) {
        Notificacao n = dao.buscarPorId(id, ctx.tenantId())
                .filter(x -> x.getUsuarioId().equals(ctx.usuarioId()))
                .orElseThrow(() -> new NaoEncontradoException("Notificação", id));
        n.marcarComoLida();
        dao.atualizar(n);
        return n;
    }

    /** RF21 / RN12: lembra quem está com equipamento que vence até amanhã (ou já venceu). */
    public int enviarLembretesDeDevolucao(Contexto ctx) {
        LocalDate amanha = LocalDate.now().plusDays(1);
        int enviados = 0;
        for (Reserva r : reservaDao.listarPorStatus(ctx.tenantId(), StatusReserva.EM_USO)) {
            if (!r.getDataFim().isAfter(amanha)) {
                enviados += lembreteDevolucao.enviar(r, ctx.tenantId());   // Template Method
            }
        }
        return enviados;
    }
}
