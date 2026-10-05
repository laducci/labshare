/*
 * ============================================================
 *  EquipamentoService.java  |  Camada: Service (regras de negócio)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Equipamentos), Q3 (reuso via CrudService)
 * ------------------------------------------------------------
 *  O que faz: regras do CRUD de equipamentos (o CRUD em si vem do CrudService)
 *  e operações usadas no fluxo de empréstimo: pesquisa, períodos ocupados,
 *  gravação só do status e verificação de outras reservas ativas.
 *  Quem chama: EquipamentoController (/api/equipamentos, telas EquipmentList,
 *              EquipmentForm, Availability), ReservaService, ProcessoChecklist,
 *              OcorrenciaService, ManutencaoService.
 *  Chama: EquipamentoDao, ReservaDao, HistoricoService (via CrudService).
 * ============================================================
 */
package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.EquipamentoDao;
import br.pucpr.labshare.dao.ReservaDao;
import br.pucpr.labshare.model.Equipamento;
import br.pucpr.labshare.model.Reserva;
import br.pucpr.labshare.model.StatusEquipamento;
import org.springframework.stereotype.Service;

import java.util.List;

// @Service: o Spring cria uma única instância e a injeta no controller e nos outros services.
@Service
public class EquipamentoService extends CrudService<Equipamento> {

    // Guardamos o DAO com o tipo concreto para usar métodos extras (pesquisar, atualizarStatus).
    private final EquipamentoDao equipamentoDao;
    private final ReservaDao reservaDao;

    // Injeção pelo construtor: o dao também vai para o CrudService (super) fazer o CRUD genérico.
    public EquipamentoService(EquipamentoDao dao, ReservaDao reservaDao, HistoricoService historico, TenantService tenants) {
        super(dao, historico, tenants);
        this.equipamentoDao = dao;
        this.reservaDao = reservaDao;
    }

    // Nome usado no histórico e nas mensagens.
    @Override
    protected String nomeEntidade() {
        return "equipamento";
    }

    // Validação do formulário EquipmentForm (POST/PUT /api/equipamentos): nome e categoria obrigatórios.
    @Override
    protected void validar(Equipamento e, Contexto ctx) {
        obrigatorio(e.getNome(), "Nome");
        obrigatorio(e.getCategoriaId(), "Categoria");
    }

    /**
     * O admin só escolhe entre "Disponível" e "Indisponível" (bloqueio administrativo).
     * Os demais status (Reservado, Em uso, Em manutenção) são controlados pelo fluxo.
     */
    // Assim a edição pela tela não "pula" etapas do fluxo (ex.: tirar da manutenção sem concluir - RN10).
    @Override
    protected void antesDeSalvar(Equipamento e, Equipamento existente, Contexto ctx) {
        boolean statusManualValido = e.getStatus() == StatusEquipamento.DISPONIVEL
                || e.getStatus() == StatusEquipamento.INDISPONIVEL;

        if (existente != null && existente.statusControladoPeloFluxo()) {
            e.setStatus(existente.getStatus());
        } else if (!statusManualValido) {
            e.setStatus(existente == null ? StatusEquipamento.DISPONIVEL : existente.getStatus());
        }
        if (e.getItensChecklist().isEmpty()) {
            e.setItensChecklist(e.getItensInclusos());   // checklist padrão = itens inclusos
        }
    }

    // Botão de desativar na EquipmentList -> DELETE /api/equipamentos/{id}: bloqueia se estiver em uso
    // ou se ainda houver reservas ativas (evita deixar reservas "órfãs").
    @Override
    protected void antesDeExcluir(Equipamento existente, Contexto ctx) {
        exigir(existente.getStatus() != StatusEquipamento.EM_USO,
                "Não é possível desativar um equipamento que está em uso.");
        exigir(reservaDao.listarAtivasDoEquipamento(ctx.tenantId(), existente.getId()).isEmpty(),
                "Cancele as reservas ativas deste equipamento antes de desativá-lo.");
    }

    // Busca por texto (GET /api/equipamentos?busca=..., tela SearchResults). Sem texto = lista tudo.
    public List<Equipamento> pesquisar(String texto, Contexto ctx) {
        if (texto == null || texto.isBlank()) return listar(ctx);
        return equipamentoDao.pesquisar(ctx.tenantId(), texto);
    }

    /** Períodos já ocupados (tela "Disponibilidade"). */
    // GET /api/equipamentos/{id}/ocupacao. O buscar() antes garante que o equipamento existe e é do cliente.
    public List<Reserva> ocupacao(Long equipamentoId, Contexto ctx) {
        buscar(equipamentoId, ctx);
        return reservaDao.listarAtivasDoEquipamento(ctx.tenantId(), equipamentoId);
    }

    /** Usado no fluxo: retirada, devolução, manutenção. */
    // Faz um UPDATE só da coluna status (não passa pelas validações do CRUD).
    public void salvarStatus(Equipamento e) {
        equipamentoDao.atualizarStatus(e);
    }

    /** Existe alguma reserva ativa além desta? (decide se volta a "Disponível" ou "Reservado") */
    public boolean possuiOutrasReservas(Long equipamentoId, Long reservaIgnorada, Contexto ctx) {
        return reservaDao.listarAtivasDoEquipamento(ctx.tenantId(), equipamentoId).stream()
                .anyMatch(r -> !r.getId().equals(reservaIgnorada));
    }
}
