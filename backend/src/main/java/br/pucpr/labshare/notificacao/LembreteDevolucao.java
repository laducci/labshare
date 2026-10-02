package br.pucpr.labshare.notificacao;

import br.pucpr.labshare.config.ConfiguracaoEmprestimo;
import br.pucpr.labshare.dao.NotificacaoDao;
import br.pucpr.labshare.model.Reserva;
import org.springframework.stereotype.Component;

import java.util.List;

/** Template Method concreto: lembra o usuário de devolver o equipamento (storyboard, quadro 15). */
@Component
public class LembreteDevolucao extends NotificacaoTemplate<Reserva> {

    public LembreteDevolucao(NotificacaoDao notificacaoDao) {
        super(notificacaoDao);
    }

    @Override
    protected List<Long> destinatarios(Reserva reserva, String tenantId) {
        return List.of(reserva.getUsuarioId());
    }

    @Override
    protected String titulo(Reserva reserva) {
        return "Lembrete de devolução";
    }

    @Override
    protected String mensagem(Reserva reserva) {
        String horario = ConfiguracaoEmprestimo.getInstance().getHorarioDevolucao();
        return "Olá, " + primeiroNome(reserva.getUsuarioNome()) + "! Não se esqueça de devolver o equipamento "
                + reserva.getEquipamentoNome() + " até " + reserva.getDataFim().format(DATA_BR) + " às " + horario + ".";
    }
}
