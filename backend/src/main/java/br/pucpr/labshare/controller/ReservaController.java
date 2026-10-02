package br.pucpr.labshare.controller;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dto.DecisaoRequest;
import br.pucpr.labshare.model.Reserva;
import br.pucpr.labshare.model.StatusReserva;
import br.pucpr.labshare.service.CrudService;
import br.pucpr.labshare.service.ReservaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController extends CrudController<Reserva> {

    private final ReservaService service;

    public ReservaController(ReservaService service) {
        this.service = service;
    }

    @Override
    protected CrudService<Reserva> service() {
        return service;
    }

    /** GET /api/reservas/minhas  (tela "Minhas reservas") */
    @GetMapping("/minhas")
    public List<Reserva> minhas(Contexto ctx) {
        return service.listarMinhas(ctx);
    }

    /** GET /api/reservas?status=AGENDADA,EM_USO  (painel do técnico / gestor) */
    @GetMapping(params = "status")
    public List<Reserva> porStatus(@RequestParam String status, Contexto ctx) {
        StatusReserva[] lista = Arrays.stream(status.split(",")).map(StatusReserva::de).toArray(StatusReserva[]::new);
        return service.listarPorStatus(ctx, lista);
    }

    /** GET /api/reservas/regras -> o que o cliente exige (aprovação, centro de custo, multa) */
    @GetMapping("/regras")
    public Map<String, Object> regras(Contexto ctx) {
        return service.regrasDoCliente(ctx);
    }

    @PostMapping("/{id}/cancelar")
    public Reserva cancelar(@PathVariable Long id, Contexto ctx) {
        return service.cancelar(id, ctx);
    }

    @PostMapping("/{id}/aprovar")
    public Reserva aprovar(@PathVariable Long id, Contexto ctx) {
        return service.aprovar(id, ctx);
    }

    @PostMapping("/{id}/rejeitar")
    public Reserva rejeitar(@PathVariable Long id, @RequestBody(required = false) DecisaoRequest decisao, Contexto ctx) {
        return service.rejeitar(id, decisao == null ? null : decisao.motivo(), ctx);
    }
}
