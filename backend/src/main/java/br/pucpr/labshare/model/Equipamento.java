/*
 * ============================================================
 *  Equipamento.java  |  Camada: Model (entidade / tabela equipamento)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Equipamentos), Q1 (classe principal)
 * ------------------------------------------------------------
 *  O que faz: Entidade central do sistema: o equipamento compartilhado. Além dos dados do
 *  cadastro, guarda as transições de status (Disponível -> Reservado -> Em uso ->
 *  Em manutenção...) e as regras RN01, RN02, RN06, RN09 e RN10 (modelo rico).
 *  Quem chama: EquipamentoDao, EquipamentoService, ReservaService, ProcessoRetirada,
 *  ProcessoDevolucao, OcorrenciaService, ManutencaoService.   Chama: StatusEquipamento, RegraNegocioException.
 * ============================================================
 */
package br.pucpr.labshare.model;

import br.pucpr.labshare.exception.RegraNegocioException;

import java.util.ArrayList;
import java.util.List;

/**
 * Recurso / Ativo compartilhado (Arduino, câmera, notebook...).
 * Os métodos abaixo implementam as transições de status do handoff (seção 16)
 * e as regras RN01, RN02, RN06, RN09 e RN10.
 */
// Herda id, tenantId e ativo de EntidadeBase (reuso).
public class Equipamento extends EntidadeBase {

    private String nome;
    private String descricao;
    private String patrimonio;
    // Todo equipamento novo nasce "Disponível".
    private StatusEquipamento status = StatusEquipamento.DISPONIVEL;
    private Long categoriaId;
    private String categoriaNome;   // vem do JOIN com categoria (só leitura)
    private String categoriaIcone;  // vem do JOIN com categoria (só leitura)
    private Long localId;
    private String localNome;       // vem do JOIN com local (só leitura)
    private String imagemUrl;
    // Listas de texto: itens que acompanham o equipamento e itens a conferir no checklist (RN05/RN07).
    private List<String> itensInclusos = new ArrayList<>();
    private List<String> itensChecklist = new ArrayList<>();

    // ---------- Regras de negócio / transições de status ----------

    /**
     * RN01 e RN02: em manutenção, em inspeção ou indisponível não pode ser reservado.
     * (Se estiver "Em uso" ou "Reservado", ainda pode ser reservado para OUTRAS datas:
     *  o ReservaService confere se o período está livre.)
     */
    public boolean podeSerReservado() {
        return ativo
                && status != StatusEquipamento.EM_MANUTENCAO
                && status != StatusEquipamento.EM_INSPECAO
                && status != StatusEquipamento.INDISPONIVEL;
    }

    // Chamado pelo ReservaService ao criar reserva (botão Confirmar reserva -> POST /api/reservas).
    // Valida RN01/RN02; se estava Disponível passa a Reservado (se já está Em uso/Reservado, mantém).
    public void marcarComoReservado() {
        if (!podeSerReservado()) {
            throw new RegraNegocioException("O equipamento " + nome + " não pode ser reservado (status: " + status.getRotulo() + ").");
        }
        if (status == StatusEquipamento.DISPONIVEL) {
            status = StatusEquipamento.RESERVADO;
        }
    }

    /** RN06: a confirmação da retirada muda o equipamento para "Em uso". */
    // Chamado pelo ProcessoRetirada (POST /api/emprestimos/{id}/retirada).
    public void registrarRetirada() {
        status = StatusEquipamento.EM_USO;
    }

    /**
     * Devolução aprovada na inspeção (ou reserva cancelada): o equipamento fica livre.
     * Se ainda existirem outras reservas futuras, ele continua "Reservado".
     */
    // Chamado pelo ProcessoDevolucao (devolução sem defeito) e pelo ReservaService (cancelamento).
    public void liberar(boolean possuiOutrasReservas) {
        status = possuiOutrasReservas ? StatusEquipamento.RESERVADO : StatusEquipamento.DISPONIVEL;
    }

    /** RN09: ocorrência que impede o uso leva o equipamento para manutenção. */
    // Chamado pelo ProcessoDevolucao quando o checklist tem defeito (RN08 -> RN09) e pelo OcorrenciaService.
    public void enviarParaManutencao() {
        status = StatusEquipamento.EM_MANUTENCAO;
    }

    /** RN10: só volta a "Disponível" depois de concluir a manutenção. */
    // Chamado ao concluir a manutenção (ManutencaoService / OcorrenciaService).
    public void liberarAposManutencao(boolean possuiOutrasReservas) {
        if (status != StatusEquipamento.EM_MANUTENCAO) {
            throw new RegraNegocioException("O equipamento não está em manutenção.");
        }
        liberar(possuiOutrasReservas);
    }

    /** Status controlados pelo fluxo (reserva/retirada/manutenção): o admin não muda à mão. */
    // Usado pelo EquipamentoService ao editar: impede que o admin "pule" o fluxo mudando o status na mão.
    public boolean statusControladoPeloFluxo() {
        return status == StatusEquipamento.RESERVADO || status == StatusEquipamento.EM_USO
                || status == StatusEquipamento.EM_INSPECAO || status == StatusEquipamento.EM_MANUTENCAO;
    }

    /** Se nenhum item de checklist foi cadastrado, usa os itens inclusos. */
    // Como começa com "get", o Jackson envia como "itensParaConferir" no JSON:
    // as telas RegisterPickup e RegisterReturn montam o checklist com essa lista.
    public List<String> getItensParaConferir() {
        return itensChecklist.isEmpty() ? itensInclusos : itensChecklist;
    }

    // ---------- Getters e setters ----------

    // Getters e setters: usados pelo Jackson para converter objeto <-> JSON (e pelos DAOs/RowMapper ao ler do banco).
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getPatrimonio() { return patrimonio; }
    public void setPatrimonio(String patrimonio) { this.patrimonio = patrimonio; }
    public StatusEquipamento getStatus() { return status; }
    public void setStatus(StatusEquipamento status) { this.status = status; }
    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
    public String getCategoriaNome() { return categoriaNome; }
    public void setCategoriaNome(String categoriaNome) { this.categoriaNome = categoriaNome; }
    public String getCategoriaIcone() { return categoriaIcone; }
    public void setCategoriaIcone(String categoriaIcone) { this.categoriaIcone = categoriaIcone; }
    public Long getLocalId() { return localId; }
    public void setLocalId(Long localId) { this.localId = localId; }
    public String getLocalNome() { return localNome; }
    public void setLocalNome(String localNome) { this.localNome = localNome; }
    public String getImagemUrl() { return imagemUrl; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }
    public List<String> getItensInclusos() { return itensInclusos; }
    // Nos setters de lista, null vira lista vazia (evita NullPointerException).
    public void setItensInclusos(List<String> itensInclusos) { this.itensInclusos = itensInclusos == null ? new ArrayList<>() : itensInclusos; }
    public List<String> getItensChecklist() { return itensChecklist; }
    public void setItensChecklist(List<String> itensChecklist) { this.itensChecklist = itensChecklist == null ? new ArrayList<>() : itensChecklist; }
}
