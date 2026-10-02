package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.HistoricoDao;
import br.pucpr.labshare.model.Historico;
import org.springframework.stereotype.Service;

import java.util.List;

/** Rastreabilidade: um único ponto para registrar "quem fez o quê" (RNF10 / RN11). */
@Service
public class HistoricoService {

    private final HistoricoDao dao;

    public HistoricoService(HistoricoDao dao) {
        this.dao = dao;
    }

    public void registrar(Contexto ctx, String entidade, Long entidadeId, String acao, String descricao) {
        dao.registrar(new Historico(ctx.tenantId(), entidade, entidadeId, acao, descricao, ctx.usuarioId()));
    }

    public List<Historico> listar(Contexto ctx, String entidade, Long entidadeId) {
        return dao.listar(ctx.tenantId(), entidade, entidadeId);
    }
}
