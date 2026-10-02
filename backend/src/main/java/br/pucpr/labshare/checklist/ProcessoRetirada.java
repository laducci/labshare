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
@Component
public class ProcessoRetirada extends ProcessoChecklist {

    public ProcessoRetirada(ReservaDao reservaDao, EquipamentoService equipamentos, HistoricoService historico) {
        super(reservaDao, equipamentos, historico);
    }

    @Override
    protected String tipo() {
        return "retirada";
    }

    /** RN05: a retirada exige que todos os itens tenham sido conferidos. */
    @Override
    protected void validarConferencia(List<ItemChecklist> itens) {
        if (itens.stream().anyMatch(ItemChecklist::temDefeito)) {
            throw new RegraNegocioException("Confira todos os itens do checklist antes de entregar o equipamento.");
        }
    }

    /** RN04 + RN06: reserva válida -> "Em uso". */
    @Override
    protected void aplicar(Reserva reserva, Equipamento equipamento, ChecklistRequest pedido,
                           Contexto ctx, ResultadoChecklist resultado) {
        reserva.iniciarEmprestimo();
        equipamento.registrarRetirada();
        resultado.setMensagem("Retirada registrada. " + equipamento.getNome() + " está em uso por " + reserva.getUsuarioNome() + ".");
    }
}
