package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.MultaDao;
import br.pucpr.labshare.model.Multa;
import br.pucpr.labshare.model.StatusMulta;
import br.pucpr.labshare.model.Tenant;
import br.pucpr.labshare.variabilidade.SeletorDeRegras;
import org.springframework.stereotype.Service;

/** VARIABILIDADE: módulo exclusivo de clientes com o recurso "lateFee" (Escola Técnica). */
@Service
public class MultaService extends CrudService<Multa> {

    private final MultaDao multaDao;
    private final SeletorDeRegras seletor;

    public MultaService(MultaDao dao, SeletorDeRegras seletor, HistoricoService historico, TenantService tenants) {
        super(dao, historico, tenants);
        this.multaDao = dao;
        this.seletor = seletor;
    }

    @Override
    protected String nomeEntidade() {
        return "multa";
    }

    @Override
    protected String recursoNecessario() {
        return Tenant.MULTA_ATRASO;   // sem este recurso, todas as rotas de multa respondem 403
    }

    @Override
    protected void validar(Multa m, Contexto ctx) {
        obrigatorio(m.getReservaId(), "Reserva");
        exigir(m.getDiasAtraso() >= 0, "Dias de atraso não pode ser negativo.");
    }

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

    public Multa registrarPagamento(Long id, Contexto ctx) {
        Multa m = buscar(id, ctx);
        m.registrarPagamento();
        multaDao.atualizar(m);
        historico.registrar(ctx, nomeEntidade(), id, "PAGAMENTO", "Multa paga: R$ " + m.getValor());
        return buscar(id, ctx);
    }
}
