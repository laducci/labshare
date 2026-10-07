/*
 * ============================================================
 *  CategoriaService.java  |  Camada: Service (regras de negócio)
 *  Responsável na apresentação: João  |  Atividade: Q2 (CRUD de Categorias), Q3 (reuso via CrudService)
 * ------------------------------------------------------------
 *  O que faz: regras do CRUD de categorias. Herda listar/buscar/criar/atualizar/
 *  excluir prontos do CrudService e só define o nome da entidade e a validação
 *  (nome obrigatório; ícone padrão "cpu" se nenhum for escolhido).
 *  Quem chama: CategoriaController (/api/categorias, tela genérica CrudPage).
 *  Chama: CategoriaDao (via CrudService), HistoricoService.
 * ============================================================
 */
package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.CategoriaDao;
import br.pucpr.labshare.model.Categoria;
import br.pucpr.labshare.integracao.SistemaPatrimonioGrupos;
import org.springframework.stereotype.Service;

// @Service: o Spring cria uma única instância desta classe e a injeta no CategoriaController.
@Service
public class CategoriaService extends CrudService<Categoria> {

    // Injeção pelo construtor; tudo é repassado para o CrudService (super), que faz o trabalho comum.
    // AIE "Grupos patrimoniais": só leitura, usado para validar o código informado.
    private final SistemaPatrimonioGrupos grupos;

    public CategoriaService(CategoriaDao dao, HistoricoService historico, TenantService tenants,
                            SistemaPatrimonioGrupos grupos) {
        super(dao, historico, tenants);
        this.grupos = grupos;
    }

    // Nome usado no histórico e nas mensagens de erro.
    @Override
    protected String nomeEntidade() {
        return "categoria";
    }

    // Gancho de validação: roda antes do INSERT/UPDATE (POST e PUT de /api/categorias).
    @Override
    protected void validar(Categoria c, Contexto ctx) {
        obrigatorio(c.getNome(), "Nome");
        // Medição (AIE): o grupo precisa existir no Sistema de Patrimônio da instituição.
        if (c.getGrupoPatrimonial() != null && c.getGrupoPatrimonial().isBlank()) c.setGrupoPatrimonial(null);
        if (c.getGrupoPatrimonial() != null) {
            exigir(grupos.buscar(ctx.tenantId(), c.getGrupoPatrimonial()).isPresent(),
                    "O grupo patrimonial " + c.getGrupoPatrimonial() + " não existe no Sistema de Patrimônio.");
        }
        if (c.getIcone() == null || c.getIcone().isBlank()) {
            c.setIcone("cpu");
        }
    }
}
