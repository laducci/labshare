/*
 * ============================================================
 *  NotificacaoController.java  |  Camada: Controller (API REST)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Template Method NotificacaoTemplate via Service), Q2
 * ------------------------------------------------------------
 *  O que faz: expõe /api/notificacoes: lista as notificações do usuário logado, marca uma como
 *  lida e dispara os lembretes de devolução (RN12). Não é um CRUD, por isso não estende CrudController.
 *  Quem chama: Layout.jsx (contador do sino), Notifications.jsx (lista e "marcar como lida"),
 *  TechnicianPanel e ActiveLoan (botão "Enviar lembretes").
 *  Chama: NotificacaoService -> NotificacaoDao / ReservaDao / LembreteDevolucao (Template Method).
 * ============================================================
 */
package br.pucpr.labshare.controller;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.model.Notificacao;
import br.pucpr.labshare.service.NotificacaoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

// @RestController: responde HTTP com JSON. @RequestMapping: prefixo /api/notificacoes.
@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {

    private final NotificacaoService service;

    // Injeção pelo construtor: o Spring entrega o NotificacaoService (@Service).
    public NotificacaoController(NotificacaoService service) {
        this.service = service;
    }

    // GET /api/notificacoes/minhas -> notificações do usuário do cabeçalho X-Usuario-Id (Contexto).
    // Chamado pelo Layout (badge do sino) e pela tela Notifications.
    @GetMapping("/minhas")
    public List<Notificacao> minhas(Contexto ctx) {
        return service.minhas(ctx);
    }

    // POST /api/notificacoes/{id}/lida -> clique na notificação. O Service confere que ela é do próprio
    // usuário (senão responde 404) e faz o UPDATE marcando como lida.
    @PostMapping("/{id}/lida")
    public Notificacao marcarComoLida(@PathVariable Long id, Contexto ctx) {
        return service.marcarComoLida(id, ctx);
    }

    /** Botão "Enviar lembretes" no painel do técnico (RF21). */
    // RN12: para cada reserva "Em uso" que vence até amanhã (ou já venceu), cria uma notificação de lembrete
    // usando o Template Method LembreteDevolucao. Devolve {"enviados": N} para a tela mostrar quantos foram.
    @PostMapping("/lembretes")
    public Map<String, Integer> enviarLembretes(Contexto ctx) {
        return Map.of("enviados", service.enviarLembretesDeDevolucao(ctx));
    }
}
