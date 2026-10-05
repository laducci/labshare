/*
 * ============================================================
 *  ProcessoRetirada.java  |  Camada: Service (fluxo de empréstimo - subclasse)
 *  Responsável na apresentação: Laura  |  Atividade: Q1 (Template Method 2 de 3), Q3 (reuso do ProcessoChecklist)
 * ------------------------------------------------------------
 *  O que faz: preenche os passos variáveis do ProcessoChecklist para a
 *  RETIRADA: exige todos os itens conferidos (RN05), confere que a reserva
 *  está Agendada (RN04) e muda reserva e equipamento para "Em uso" (RN06).
 *  Quem chama: EmprestimoController -> POST /api/emprestimos/{reservaId}/retirada
 *              (tela RegisterPickup, botão de confirmar a retirada).
 *  Chama: métodos de domínio Reserva.iniciarEmprestimo e Equipamento.registrarRetirada.
 * ============================================================
 */
package br.pucpr.labshare.checklist;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.ReservaDao;
import br.pucpr.labshare.dto.ChecklistRequest;
import br.pucpr.labshare.dto.ResultadoChecklist;
import br.pucpr.labshare.exception.RegraNegocioException;
import br.pucpr.labshare.model.Equipamento;
import br.pucpr.labshare.model.ItemChecklist;
import br.pucpr.labshare.model.Reserva;
import br.pucpr.labshare.service.EquipamentoService;
import br.pucpr.labshare.service.HistoricoService;
import org.springframework.stereotype.Component;

import java.util.List;

/** Template Method concreto: retirada (storyboard, quadros 12 a 14). */
// @Component: o Spring cria este objeto e o injeta no EmprestimoController.
@Component
public class ProcessoRetirada extends ProcessoChecklist {

    // Injeção pelo construtor; repassa as dependências para a classe-mãe com super(...).
    public ProcessoRetirada(ReservaDao reservaDao, EquipamentoService equipamentos, HistoricoService historico) {
        super(reservaDao, equipamentos, historico);
    }

    // Passo abstrato: nome do processo (usado no histórico e nas observações).
    @Override
    protected String tipo() {
        return "retirada";
    }

    /** RN05: a retirada exige que todos os itens tenham sido conferidos. */
    // Gancho sobrescrito: se algum item veio marcado com problema, a entrega é bloqueada (HTTP 400).
    @Override
    protected void validarConferencia(List<ItemChecklist> itens) {
        if (itens.stream().anyMatch(ItemChecklist::temDefeito)) {
            throw new RegraNegocioException("Confira todos os itens do checklist antes de entregar o equipamento.");
        }
    }

    /** RN04 + RN06: reserva válida -> "Em uso". */
    // iniciarEmprestimo() lança erro se a reserva não estiver AGENDADA (RN04) e grava a data de retirada.
    @Override
    protected void aplicar(Reserva reserva, Equipamento equipamento, ChecklistRequest pedido,
                           Contexto ctx, ResultadoChecklist resultado) {
        reserva.iniciarEmprestimo();
        equipamento.registrarRetirada();
        resultado.setMensagem("Retirada registrada. " + equipamento.getNome() + " está em uso por " + reserva.getUsuarioNome() + ".");
    }
}
