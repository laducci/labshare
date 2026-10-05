/*
 * ============================================================
 *  EquipamentoDao.java  |  Camada: DAO (acesso ao banco, tabela equipamento)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Equipamentos), Q1 (Template Method), Q3 (compactação)
 * ------------------------------------------------------------
 *  O que faz: acesso à tabela "equipamento". O CRUD básico vem do AbstractDao;
 *  aqui ficam só os passos específicos (colunas, leitura da linha), os JOINs
 *  com categoria/local e duas consultas próprias: pesquisa por texto e troca de status.
 *  Quem chama: EquipamentoService <- EquipamentoController <- telas EquipmentList,
 *              EquipmentForm, EquipmentDetails, SearchResults (front).
 *  Chama: AbstractDao -> JdbcTemplate -> PostgreSQL.
 * ============================================================
 */
package br.pucpr.labshare.dao;

import br.pucpr.labshare.model.Equipamento;
import br.pucpr.labshare.model.StatusEquipamento;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

// @Repository: componente de acesso a dados; o Spring cria uma instância e a injeta no EquipamentoService.
// Template Method: herda o algoritmo do CRUD do AbstractDao e só define o que é específico.
@Repository
public class EquipamentoDao extends AbstractDao<Equipamento> {

    // Injeção pelo construtor: recebe o JdbcTemplate do Spring e repassa ao AbstractDao.
    public EquipamentoDao(JdbcTemplate jdbc) {
        super(jdbc);
    }

    // Passo abstrato: nome da tabela.
    @Override
    protected String tabela() {
        return "equipamento";
    }

    // Passo abstrato: colunas gravadas no INSERT/UPDATE (o AbstractDao acrescenta tenant_id e ativo).
    @Override
    protected List<String> colunas() {
        return List.of("nome", "descricao", "patrimonio", "status", "categoria_id", "local_id",
                "imagem_url", "itens_inclusos", "itens_checklist");
    }

    // Passo abstrato: valores na MESMA ordem das colunas acima.
    // nomeEnum converte o status (enum) em texto; emLinhas converte as listas em texto com um item por linha.
    @Override
    protected Object[] valores(Equipamento e) {
        return new Object[]{e.getNome(), e.getDescricao(), e.getPatrimonio(), nomeEnum(e.getStatus()),
                e.getCategoriaId(), e.getLocalId(), e.getImagemUrl(),
                emLinhas(e.getItensInclusos()), emLinhas(e.getItensChecklist())};
    }

    /** Gancho sobrescrito: traz o nome da categoria e do local junto. */
    // LEFT JOIN (e não JOIN) para o equipamento aparecer mesmo se ainda não tiver categoria ou local.
    @Override
    protected String joins() {
        return "LEFT JOIN categoria c ON c.id = t.categoria_id "
             + "LEFT JOIN local l ON l.id = t.local_id";
    }

    // Gancho: colunas vindas dos JOINs, usadas no card do equipamento (nome/ícone da categoria, nome do local).
    @Override
    protected String colunasExtras() {
        return ", c.nome AS categoria_nome, c.icone AS categoria_icone, l.nome AS local_nome";
    }

    // Gancho: lista em ordem alfabética.
    @Override
    protected String ordenacao() {
        return "t.nome";
    }

    // Passo abstrato: linha do banco -> objeto Equipamento.
    // valueOf transforma o texto "DISPONIVEL" de volta no enum StatusEquipamento.DISPONIVEL;
    // deLinhas transforma o texto com quebras de linha de volta em lista (itens do checklist).
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
    // Chamado pela barra de busca -> GET /api/equipamentos?busca=texto -> EquipamentoService.pesquisar.
    // Os "%" ao redor fazem o "contém" (ex.: "%arduino%"). O texto vai como parâmetro "?",
    // nunca colado no SQL, por isso não há risco de SQL Injection.
    public List<Equipamento> pesquisar(String tenantId, String texto) {
        String termo = "%" + texto.trim() + "%";
        return buscarOnde(tenantId, "t.nome ILIKE ? OR c.nome ILIKE ? OR t.patrimonio ILIKE ?", termo, termo, termo);
    }

    /** RF20: só o status muda nas transições do fluxo (retirada, devolução, manutenção). */
    // Usado nas transições das regras de negócio: retirada -> EM_USO (RN06), ocorrência ->
    // EM_MANUTENCAO (RN09), manutenção concluída -> DISPONIVEL (RN10).
    // SQL: UPDATE equipamento SET status = ? WHERE id = ? AND tenant_id = ?
    public void atualizarStatus(Equipamento e) {
        executar("UPDATE equipamento SET status = ? WHERE id = ? AND tenant_id = ?",
                e.getStatus().name(), e.getId(), e.getTenantId());
    }
}
