/*
 * ============================================================
 *  AvisoManutencaoConcluida.java  |  Camada: Service (notificações - subclasse)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Template Method 3 de 3)
 * ------------------------------------------------------------
 *  O que faz: quando uma manutenção é concluída (RN10), avisa técnicos e
 *  administradores do cliente que o equipamento voltou a ficar disponível.
 *  Quem chama: ManutencaoService.concluir (POST /api/manutencoes/{id}/concluir,
 *              tela EquipmentMaintenance).
 *  Chama: UsuarioDao.listarPorPerfil (SELECT dos usuários TECNICO e ADMIN).
 * ============================================================
 */
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
// @Component: o Spring cria este objeto e o injeta no ManutencaoService.
@Component
public class AvisoManutencaoConcluida extends NotificacaoTemplate<Manutencao> {

    private final UsuarioDao usuarioDao;

    // Injeção pelo construtor: o DAO de notificação vai para a classe-mãe; o de usuário fica aqui.
    public AvisoManutencaoConcluida(NotificacaoDao notificacaoDao, UsuarioDao usuarioDao) {
        super(notificacaoDao);
        this.usuarioDao = usuarioDao;
    }

    // Passo 1: junta (Stream.concat) os técnicos e os admins do cliente e pega só os ids.
    @Override
    protected List<Long> destinatarios(Manutencao manutencao, String tenantId) {
        return Stream.concat(
                        usuarioDao.listarPorPerfil(tenantId, Perfil.TECNICO).stream(),
                        usuarioDao.listarPorPerfil(tenantId, Perfil.ADMIN).stream())
                .map(Usuario::getId)
                .toList();
    }

    // Passo 2: título fixo.
    @Override
    protected String titulo(Manutencao manutencao) {
        return "Equipamento liberado";
    }

    // Passo 3: mensagem com o nome do equipamento que saiu da manutenção.
    @Override
    protected String mensagem(Manutencao manutencao) {
        return "A manutenção de " + manutencao.getEquipamentoNome() + " foi concluída. O equipamento está disponível novamente.";
    }
}
