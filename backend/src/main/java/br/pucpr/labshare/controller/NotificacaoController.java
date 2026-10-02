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

@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {

    private final NotificacaoService service;

    public NotificacaoController(NotificacaoService service) {
        this.service = service;
    }

    @GetMapping("/minhas")
    public List<Notificacao> minhas(Contexto ctx) {
        return service.minhas(ctx);
    }

    @PostMapping("/{id}/lida")
    public Notificacao marcarComoLida(@PathVariable Long id, Contexto ctx) {
        return service.marcarComoLida(id, ctx);
    }

    /** Botão "Enviar lembretes" no painel do técnico (RF21). */
    @PostMapping("/lembretes")
    public Map<String, Integer> enviarLembretes(Contexto ctx) {
        return Map.of("enviados", service.enviarLembretesDeDevolucao(ctx));
    }
}
