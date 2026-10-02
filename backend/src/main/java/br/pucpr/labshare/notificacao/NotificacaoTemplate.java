package br.pucpr.labshare.notificacao;

import br.pucpr.labshare.dao.NotificacaoDao;
import br.pucpr.labshare.model.Notificacao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * ============================================================
 *  PADRÃO DE PROJETO: TEMPLATE METHOD  (exemplo 3 de 3)
 * ============================================================
 * Toda notificação do LabShare segue o mesmo roteiro:
 *   1. descobrir QUEM recebe       (varia)
 *   2. montar o TÍTULO             (varia)
 *   3. montar a MENSAGEM           (varia)
 *   4. gravar uma notificação para cada destinatário (sempre igual)
 *
 * O método enviar() é o template (final). As subclasses só preenchem os passos 1, 2 e 3:
 *   - LembreteDevolucao          (RN12 / RF21: "Sua devolução vence amanhã")
 *   - AvisoReservaPendente       (gestor recebe pedido de aprovação)
 *   - AvisoManutencaoConcluida   (técnicos sabem que o item voltou a ficar disponível)
 *
 * @param <C> o objeto que originou a notificação (Reserva, Manutencao...)
 */
public abstract class NotificacaoTemplate<C> {

    protected static final DateTimeFormatter DATA_BR = DateTimeFormatter.ofPattern("dd/MM");
    private static final Logger log = LoggerFactory.getLogger(NotificacaoTemplate.class);

    protected final NotificacaoDao notificacaoDao;

    protected NotificacaoTemplate(NotificacaoDao notificacaoDao) {
        this.notificacaoDao = notificacaoDao;
    }

    /** MÉTODO-TEMPLATE: o algoritmo é fixo. Devolve quantas notificações foram geradas. */
    public final int enviar(C origem, String tenantId) {
        List<Long> destinatarios = destinatarios(origem, tenantId);   // passo 1
        if (destinatarios.isEmpty()) {
            return 0;
        }
        String titulo = titulo(origem);                               // passo 2
        String mensagem = mensagem(origem);                           // passo 3

        for (Long usuarioId : destinatarios) {                        // passo 4 (comum)
            notificacaoDao.inserir(new Notificacao(tenantId, usuarioId, titulo, mensagem));
        }
        log.info("[Notificação] {} -> {} destinatário(s)", getClass().getSimpleName(), destinatarios.size());
        return destinatarios.size();
    }

    // ---------- passos que cada notificação define ----------

    protected abstract List<Long> destinatarios(C origem, String tenantId);

    protected abstract String titulo(C origem);

    protected abstract String mensagem(C origem);

    protected static String primeiroNome(String nomeCompleto) {
        return nomeCompleto == null ? "" : nomeCompleto.trim().split("\\s+")[0];
    }
}
