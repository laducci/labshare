package br.pucpr.labshare.notificacao;

import br.pucpr.labshare.dao.NotificacaoDao;
import br.pucpr.labshare.dao.UsuarioDao;
import br.pucpr.labshare.model.Perfil;
import br.pucpr.labshare.model.Reserva;
import br.pucpr.labshare.model.Usuario;
import org.springframework.stereotype.Component;

import java.util.List;

/** Template Method concreto: avisa os gestores que há uma reserva aguardando aprovação (Empresa). */
@Component
public class AvisoReservaPendente extends NotificacaoTemplate<Reserva> {

    private final UsuarioDao usuarioDao;

    public AvisoReservaPendente(NotificacaoDao notificacaoDao, UsuarioDao usuarioDao) {
        super(notificacaoDao);
        this.usuarioDao = usuarioDao;
    }

    @Override
    protected List<Long> destinatarios(Reserva reserva, String tenantId) {
        return usuarioDao.listarPorPerfil(tenantId, Perfil.GESTOR).stream().map(Usuario::getId).toList();
    }

    @Override
    protected String titulo(Reserva reserva) {
        return "Nova solicitação aguardando aprovação";
    }

    @Override
    protected String mensagem(Reserva reserva) {
        return reserva.getUsuarioNome() + " solicitou " + reserva.getEquipamentoNome() + " de "
                + reserva.getDataInicio().format(DATA_BR) + " a " + reserva.getDataFim().format(DATA_BR) + ".";
    }
}
