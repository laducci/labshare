/*
 * ============================================================
 *  NotificacaoTemplate.java  |  Camada: Service (notificações - classe abstrata)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Template Method 3 de 3), Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: roteiro único para gerar notificações internas: descobre os
 *  destinatários, monta título e mensagem e grava uma linha na tabela de
 *  notificações para cada destinatário. As subclasses só dizem QUEM e O QUÊ.
 *  Quem chama: NotificacaoService (lembrete), ReservaService (reserva pendente),
 *              ManutencaoService (manutenção concluída) - sempre via enviar().
 *  Chama: NotificacaoDao.inserir (INSERT no banco).
 * ============================================================
 */
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
// Classe genérica <C>: cada subclasse escolhe o tipo de origem (Reserva ou Manutencao) sem precisar de cast.
public abstract class NotificacaoTemplate<C> {

    // Formato de data "dia/mês" usado nas mensagens; protected para as subclasses reutilizarem.
    protected static final DateTimeFormatter DATA_BR = DateTimeFormatter.ofPattern("dd/MM");
    // Logger: escreve no console do servidor quantas notificações foram geradas (ajuda a depurar).
    private static final Logger log = LoggerFactory.getLogger(NotificacaoTemplate.class);

    protected final NotificacaoDao notificacaoDao;

    // Injeção pelo construtor: as subclasses (@Component) recebem o DAO do Spring e repassam via super(...).
    protected NotificacaoTemplate(NotificacaoDao notificacaoDao) {
        this.notificacaoDao = notificacaoDao;
    }

    /** MÉTODO-TEMPLATE: o algoritmo é fixo. Devolve quantas notificações foram geradas. */
    // "final" impede que uma subclasse mude a ordem dos passos.
    public final int enviar(C origem, String tenantId) {
        List<Long> destinatarios = destinatarios(origem, tenantId);   // passo 1
        // Ninguém para avisar (ex.: cliente sem gestor cadastrado): não grava nada.
        if (destinatarios.isEmpty()) {
            return 0;
        }
        String titulo = titulo(origem);                               // passo 2
        String mensagem = mensagem(origem);                           // passo 3

        // Uma linha por usuário (INSERT INTO notificacao ...), sempre com o tenantId do cliente.
        for (Long usuarioId : destinatarios) {                        // passo 4 (comum)
            notificacaoDao.inserir(new Notificacao(tenantId, usuarioId, titulo, mensagem));
        }
        log.info("[Notificação] {} -> {} destinatário(s)", getClass().getSimpleName(), destinatarios.size());
        return destinatarios.size();
    }

    // ---------- passos que cada notificação define ----------

    // Passo 1 (abstrato): ids dos usuários que vão receber.
    protected abstract List<Long> destinatarios(C origem, String tenantId);

    // Passo 2 (abstrato): título curto da notificação.
    protected abstract String titulo(C origem);

    // Passo 3 (abstrato): texto completo da notificação.
    protected abstract String mensagem(C origem);

    // Utilitário para as subclasses: "Ana Maria Souza" -> "Ana" (split por espaços).
    protected static String primeiroNome(String nomeCompleto) {
        return nomeCompleto == null ? "" : nomeCompleto.trim().split("\\s+")[0];
    }
}
