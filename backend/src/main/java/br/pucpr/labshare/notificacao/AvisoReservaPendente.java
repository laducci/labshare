/*
 * ============================================================
 *  AvisoReservaPendente.java  |  Camada: Service (notificações - subclasse)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Template Method 3 de 3), Q2 (variabilidade: aprovação)
 * ------------------------------------------------------------
 *  O que faz: avisa todos os gestores do cliente que chegou uma reserva
 *  "Aguardando aprovação". Só acontece para clientes com o recurso
 *  approvalRequired (Empresa Corporativa), por causa da Strategy AprovacaoPeloGestor.
 *  Quem chama: ReservaService.depoisDeCriar (após POST /api/reservas na tela ConfirmReservation).
 *  Chama: UsuarioDao.listarPorPerfil (SELECT dos usuários com perfil GESTOR).
 * ============================================================
 */
package br.pucpr.labshare.notificacao;

import br.pucpr.labshare.dao.NotificacaoDao;
import br.pucpr.labshare.dao.UsuarioDao;
import br.pucpr.labshare.model.Perfil;
import br.pucpr.labshare.model.Reserva;
import br.pucpr.labshare.model.Usuario;
import org.springframework.stereotype.Component;

import java.util.List;

/** Template Method concreto: avisa os gestores que há uma reserva aguardando aprovação (Empresa). */
// @Component: o Spring cria este objeto e o injeta no ReservaService.
@Component
public class AvisoReservaPendente extends NotificacaoTemplate<Reserva> {

    private final UsuarioDao usuarioDao;

    // Injeção pelo construtor: o DAO de notificação vai para a classe-mãe; o de usuário fica aqui.
    public AvisoReservaPendente(NotificacaoDao notificacaoDao, UsuarioDao usuarioDao) {
        super(notificacaoDao);
        this.usuarioDao = usuarioDao;
    }

    // Passo 1: todos os usuários com perfil GESTOR deste cliente (stream -> map pega só o id).
    @Override
    protected List<Long> destinatarios(Reserva reserva, String tenantId) {
        return usuarioDao.listarPorPerfil(tenantId, Perfil.GESTOR).stream().map(Usuario::getId).toList();
    }

    // Passo 2: título fixo.
    @Override
    protected String titulo(Reserva reserva) {
        return "Nova solicitação aguardando aprovação";
    }

    // Passo 3: quem pediu, qual equipamento e o período (datas no formato dd/MM).
    @Override
    protected String mensagem(Reserva reserva) {
        return reserva.getUsuarioNome() + " solicitou " + reserva.getEquipamentoNome() + " de "
                + reserva.getDataInicio().format(DATA_BR) + " a " + reserva.getDataFim().format(DATA_BR) + ".";
    }
}
