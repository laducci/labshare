package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Equipamento;
import br.pucpr.labshare.model.StatusEquipamento;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class EquipamentoDao extends AbstractDao<Equipamento> {

    public EquipamentoDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    @Override
    protected String tabela() {
        return "equipamento";
    }

    @Override
    protected List<String> colunas() {
        return List.of("nome", "descricao", "patrimonio", "status", "categoria_id", "local_id",
                "imagem_url", "itens_inclusos", "itens_checklist");
    }

    @Override
    protected Object[] valores(Equipamento e) {
        return new Object[]{e.getNome(), e.getDescricao(), e.getPatrimonio(), nomeEnum(e.getStatus()),
                e.getCategoriaId(), e.getLocalId(), e.getImagemUrl(),
                emLinhas(e.getItensInclusos()), emLinhas(e.getItensChecklist())};
    }

    /** Gancho sobrescrito: traz o nome da categoria e do local junto. */
    @Override
    protected String joins() {
        return "LEFT JOIN categoria c ON c.id = t.categoria_id "
             + "LEFT JOIN local l ON l.id = t.local_id";
    }

    @Override
    protected String colunasExtras() {
        return ", c.nome AS categoria_nome, c.icone AS categoria_icone, l.nome AS local_nome";
    }

    @Override
    protected String ordenacao() {
        return "t.nome";
    }

    @Override
    protected Equipamento criarObjeto(ResultSet rs) throws SQLException {
        Equipamento e = new Equipamento();
        e.setNome(rs.getString("nome"));
        e.setDescricao(rs.getString("descricao"));
        e.setPatrimonio(rs.getString("patrimonio"));
        e.setStatus(StatusEquipamento.valueOf(rs.getString("status")));
        e.setCategoriaId(longOuNulo(rs, "categoria_id"));
        e.setCategoriaNome(rs.getString("categoria_nome"));
        e.setCategoriaIcone(rs.getString("categoria_icone"));
        e.setLocalId(longOuNulo(rs, "local_id"));
        e.setLocalNome(rs.getString("local_nome"));
        e.setImagemUrl(rs.getString("imagem_url"));
        e.setItensInclusos(deLinhas(rs.getString("itens_inclusos")));
        e.setItensChecklist(deLinhas(rs.getString("itens_checklist")));
        return e;
    }

    /** RF03/RF07: pesquisa por nome, categoria ou patrimônio (ILIKE = sem diferenciar maiúsculas). */
    public List<Equipamento> pesquisar(String tenantId, String texto) {
        String termo = "%" + texto.trim() + "%";
        return buscarOnde(tenantId, "t.nome ILIKE ? OR c.nome ILIKE ? OR t.patrimonio ILIKE ?", termo, termo, termo);
    }

    /** RF20: só o status muda nas transições do fluxo (retirada, devolução, manutenção). */
    public void atualizarStatus(Equipamento e) {
        executar("UPDATE equipamento SET status = ? WHERE id = ? AND tenant_id = ?",
                e.getStatus().name(), e.getId(), e.getTenantId());
    }
}
