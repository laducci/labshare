/*
 * ============================================================
 *  LembreteDevolucao.java  |  Camada: Service (notificações - subclasse)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Template Method 3 de 3 + usa Singleton)
 * ------------------------------------------------------------
 *  O que faz: notificação RN12/RF21 - lembra o usuário que está com o
 *  equipamento de devolvê-lo até a data final, no horário configurado.
 *  Quem chama: NotificacaoService.enviarLembretesDeDevolucao
 *              (POST /api/notificacoes/lembretes, telas TechnicianPanel e ActiveLoan).
 *  Chama: ConfiguracaoEmprestimo.getInstance() (Singleton) para o horário de devolução.
 * ============================================================
 */
package br.pucpr.labshare.notificacao;

import br.pucpr.labshare.config.ConfiguracaoEmprestimo;
import br.pucpr.labshare.dao.NotificacaoDao;
import br.pucpr.labshare.model.Reserva;
import org.springframework.stereotype.Component;

import java.util.List;

/** Template Method concreto: lembra o usuário de devolver o equipamento (storyboard, quadro 15). */
// @Component: o Spring cria este objeto e o injeta no NotificacaoService.
@Component
public class LembreteDevolucao extends NotificacaoTemplate<Reserva> {

    // Injeção pelo construtor: repassa o DAO para a classe-mãe.
    public LembreteDevolucao(NotificacaoDao notificacaoDao) {
        super(notificacaoDao);
    }

    // Passo 1: só o dono da reserva recebe o lembrete.
    @Override
    protected List<Long> destinatarios(Reserva reserva, String tenantId) {
        return List.of(reserva.getUsuarioId());
    }

    // Passo 2: título fixo.
    @Override
    protected String titulo(Reserva reserva) {
        return "Lembrete de devolução";
    }

    // Passo 3: mensagem personalizada com primeiro nome, equipamento, data final e horário (Singleton).
    @Override
    protected String mensagem(Reserva reserva) {
        String horario = ConfiguracaoEmprestimo.getInstance().getHorarioDevolucao();
        return "Olá, " + primeiroNome(reserva.getUsuarioNome()) + "! Não se esqueça de devolver o equipamento "
                + reserva.getEquipamentoNome() + " até " + reserva.getDataFim().format(DATA_BR) + " às " + horario + ".";
    }
}
