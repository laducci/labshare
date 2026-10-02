package br.pucpr.labshare.notificacao;

import br.pucpr.labshare.dao.NotificacaoDao;
import br.pucpr.labshare.dao.UsuarioDao;
import br.pucpr.labshare.model.Manutencao;
import br.pucpr.labshare.model.Perfil;
import br.pucpr.labshare.model.Usuario;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Stream;

/** Template Method concreto: avisa técnicos e admins que o equipamento voltou a ficar disponível. */
@Component
public class AvisoManutencaoConcluida extends NotificacaoTemplate<Manutencao> {

    private final UsuarioDao usuarioDao;

    public AvisoManutencaoConcluida(NotificacaoDao notificacaoDao, UsuarioDao usuarioDao) {
        super(notificacaoDao);
        this.usuarioDao = usuarioDao;
    }

    @Override
    protected List<Long> destinatarios(Manutencao manutencao, String tenantId) {
        return Stream.concat(
                        usuarioDao.listarPorPerfil(tenantId, Perfil.TECNICO).stream(),
                        usuarioDao.listarPorPerfil(tenantId, Perfil.ADMIN).stream())
                .map(Usuario::getId)
                .toList();
    }

    @Override
    protected String titulo(Manutencao manutencao) {
        return "Equipamento liberado";
    }

    @Override
    protected String mensagem(Manutencao manutencao) {
        return "A manutenção de " + manutencao.getEquipamentoNome() + " foi concluída. O equipamento está disponível novamente.";
    }
}
