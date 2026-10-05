/*
 * ============================================================
 *  ReservaController.java  |  Camada: Controller (API REST)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Reservas), Q1 (usa Strategy via Service), Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: expõe /api/reservas. O CRUD básico vem herdado do CrudController (criar = POST
 *  /api/reservas na tela "Confirmar reserva"; DELETE = cancelar). Aqui ficam as rotas extras:
 *  minhas reservas, filtro por status, regras do cliente, cancelar, aprovar e rejeitar.
 *  Quem chama: ConfirmReservation, MyReservations, ReservationDetail, ReservationSuccess,
 *  TechnicianPanel, ManagerPanel, ApprovalDetail, Home.
 *  Chama: ReservaService (regras RN01-RN03, Strategy RegraAprovacao/RegraCentroCusto) -> ReservaDao.
 * ============================================================
 */
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

// @RestController: responde HTTP com JSON. @RequestMapping: prefixo /api/reservas para todas as rotas.
// Herda do CrudController as rotas GET, GET/{id}, POST, PUT/{id} e DELETE/{id}.
@RestController
@RequestMapping("/api/reservas")
public class ReservaController extends CrudController<Reserva> {

    private final ReservaService service;

    // Injeção pelo construtor: o Spring entrega o ReservaService (@Service).
    public ReservaController(ReservaService service) {
        this.service = service;
    }

    // Gancho do CrudController: as rotas herdadas usam o ReservaService.
    // Ex.: botão "Confirmar reserva" -> POST /api/reservas -> CrudController.criar -> ReservaService
    // valida RN01/RN02 (equipamento reservável), RN03 (datas) e conflito de período -> INSERT INTO reserva.
    @Override
    protected CrudService<Reserva> service() {
        return service;
    }

    /** GET /api/reservas/minhas  (tela "Minhas reservas") */
    // Usa o X-Usuario-Id do Contexto para trazer só as reservas do usuário logado.
    @GetMapping("/minhas")
    public List<Reserva> minhas(Contexto ctx) {
        return service.listarMinhas(ctx);
    }

    /** GET /api/reservas?status=AGENDADA,EM_USO  (painel do técnico / gestor) */
    // "params = status": só entra aqui se a URL tiver ?status=...; senão vale o listar() herdado.
    // Converte o texto "AGENDADA,EM_USO" em um array de enum StatusReserva (split por vírgula + StatusReserva.de).
    // Status inválido gera IllegalArgumentException -> TratadorDeErros responde 400.
    @GetMapping(params = "status")
    public List<Reserva> porStatus(@RequestParam String status, Contexto ctx) {
        StatusReserva[] lista = Arrays.stream(status.split(",")).map(StatusReserva::de).toArray(StatusReserva[]::new);
        return service.listarPorStatus(ctx, lista);
    }

    /** GET /api/reservas/regras -> o que o cliente exige (aprovação, centro de custo, multa) */
    // VARIABILIDADE: a tela ConfirmReservation lê isto para saber se mostra o campo de centro de custo
    // e o aviso de aprovação. O Service consulta o SeletorDeRegras (Strategy) e o Singleton ConfiguracaoEmprestimo.
    @GetMapping("/regras")
    public Map<String, Object> regras(Contexto ctx) {
        return service.regrasDoCliente(ctx);
    }

    // Botão "Cancelar reserva" (ReservationDetail) -> POST /api/reservas/{id}/cancelar.
    // Muda o status para cancelada (UPDATE), libera o equipamento se não houver outra reserva e grava histórico (RN11).
    @PostMapping("/{id}/cancelar")
    public Reserva cancelar(@PathVariable Long id, Contexto ctx) {
        return service.cancelar(id, ctx);
    }

    // Botão "Aprovar" (ApprovalDetail, perfil gestor) -> POST /api/reservas/{id}/aprovar.
    // Só existe para clientes com o recurso "approvalRequired"; nos outros o Service responde 403.
    @PostMapping("/{id}/aprovar")
    public Reserva aprovar(@PathVariable Long id, Contexto ctx) {
        return service.aprovar(id, ctx);
    }

    // Botão "Rejeitar" (ApprovalDetail) -> POST /api/reservas/{id}/rejeitar  { "motivo": "..." }.
    // @RequestBody(required = false): o corpo é opcional; se vier vazio, "decisao" fica null e o motivo também.
    @PostMapping("/{id}/rejeitar")
    public Reserva rejeitar(@PathVariable Long id, @RequestBody(required = false) DecisaoRequest decisao, Contexto ctx) {
        return service.rejeitar(id, decisao == null ? null : decisao.motivo(), ctx);
    }
}
