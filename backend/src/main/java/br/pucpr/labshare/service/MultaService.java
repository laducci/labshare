/*
 * ============================================================
 *  MultaService.java  |  Camada: Service (regras de negócio)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (variabilidade: módulo lateFee), Q1 (usa Strategy CalculoMulta)
 * ------------------------------------------------------------
 *  O que faz: CRUD de multas por atraso + registro de pagamento. Módulo EXCLUSIVO
 *  de clientes com o recurso "lateFee" (Escola Técnica). O valor nunca vem da
 *  tela: é sempre recalculado pela estratégia de multa do cliente.
 *  Quem chama: MultaController (/api/multas e POST /api/multas/{id}/pagar; tela LateFeePanel/CrudPage).
 *  Chama: MultaDao, SeletorDeRegras (Strategy), HistoricoService, TenantService.
 * ============================================================
 */
package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.MultaDao;
import br.pucpr.labshare.model.Multa;
import br.pucpr.labshare.model.StatusMulta;
import br.pucpr.labshare.model.Tenant;
import br.pucpr.labshare.variabilidade.SeletorDeRegras;
import org.springframework.stereotype.Service;

/** VARIABILIDADE: módulo exclusivo de clientes com o recurso "lateFee" (Escola Técnica). */
// @Service: bean do Spring, injetado no MultaController.
@Service
public class MultaService extends CrudService<Multa> {

    private final MultaDao multaDao;
    private final SeletorDeRegras seletor;

    // Injeção pelo construtor; o seletor é quem entrega a Strategy de multa do cliente.
    public MultaService(MultaDao dao, SeletorDeRegras seletor, HistoricoService historico, TenantService tenants) {
        super(dao, historico, tenants);
        this.multaDao = dao;
        this.seletor = seletor;
    }

    // Nome usado no histórico e nas mensagens.
    @Override
    protected String nomeEntidade() {
        return "multa";
    }

    // Gancho de variabilidade lido pelo CrudService.verificarRecurso().
    @Override
    protected String recursoNecessario() {
        return Tenant.MULTA_ATRASO;   // sem este recurso, todas as rotas de multa respondem 403
    }

    // Validação antes de gravar: precisa de reserva e dias de atraso não negativos.
    @Override
    protected void validar(Multa m, Contexto ctx) {
        obrigatorio(m.getReservaId(), "Reserva");
        exigir(m.getDiasAtraso() >= 0, "Dias de atraso não pode ser negativo.");
    }

    // Criação: multa nasce EM_ABERTO. Edição: mantém a reserva e o status anteriores.
    @Override
    protected void antesDeSalvar(Multa m, Multa existente, Contexto ctx) {
        // o valor é sempre calculado pela estratégia do cliente (Strategy)
        m.setValor(seletor.para(ctx.tenantId()).multa().calcular(m.getDiasAtraso()));
        if (existente == null) {
            m.setStatus(StatusMulta.EM_ABERTO);
        } else {
            m.setReservaId(existente.getReservaId());
            if (m.getStatus() == null) m.setStatus(existente.getStatus());
        }
    }

    // Botão "Pagar" -> POST /api/multas/{id}/pagar: marca como paga, faz UPDATE e registra no histórico.
    public Multa registrarPagamento(Long id, Contexto ctx) {
        Multa m = buscar(id, ctx);
        m.registrarPagamento();
        multaDao.atualizar(m);
        historico.registrar(ctx, nomeEntidade(), id, "PAGAMENTO", "Multa paga: R$ " + m.getValor());
        return buscar(id, ctx);
    }
}
