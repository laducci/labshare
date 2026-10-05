/*
 * ============================================================
 *  Multa.java  |  Camada: Model (entidade / tabela multa)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (variabilidade lateFee), Q1 (Strategy CalculoMulta)
 * ------------------------------------------------------------
 *  O que faz: Multa por atraso na devolução. Só é gerada para clientes com o recurso
 *  "lateFee": o SeletorDeRegras escolhe a estratégia MultaPorDiaDeAtraso
 *  (senão SemMulta), chamada pelo ProcessoDevolucao.
 *  Quem chama: MultaPorDiaDeAtraso, ProcessoDevolucao, MultaDao, MultaService, MultaController.
 *  Chama: StatusMulta, RegraNegocioException.
 * ============================================================
 */
package br.pucpr.labshare.model;

import br.pucpr.labshare.exception.RegraNegocioException;

import java.math.BigDecimal;

/** VARIABILIDADE: só é gerada para clientes com o recurso "lateFee" (Escola Técnica). */
// Herda id, tenantId e ativo de EntidadeBase.
public class Multa extends EntidadeBase {

    private Long reservaId;
    private String usuarioNome;      // JOIN (só leitura)
    private String equipamentoNome;  // JOIN (só leitura)
    private int diasAtraso;
    // BigDecimal: tipo certo para dinheiro (double tem erro de arredondamento).
    private BigDecimal valor = BigDecimal.ZERO;
    private StatusMulta status = StatusMulta.EM_ABERTO;

    // Botão de registrar pagamento (tela de multas) -> MultaController -> MultaService. Não deixa pagar duas vezes.
    public void registrarPagamento() {
        if (status == StatusMulta.PAGA) {
            throw new RegraNegocioException("Esta multa já está paga.");
        }
        status = StatusMulta.PAGA;
    }

    // Getters e setters: usados pelo Jackson para converter objeto <-> JSON (e pelos DAOs/RowMapper ao ler do banco).
    public Long getReservaId() { return reservaId; }
    public void setReservaId(Long reservaId) { this.reservaId = reservaId; }
    public String getUsuarioNome() { return usuarioNome; }
    public void setUsuarioNome(String usuarioNome) { this.usuarioNome = usuarioNome; }
    public String getEquipamentoNome() { return equipamentoNome; }
    public void setEquipamentoNome(String equipamentoNome) { this.equipamentoNome = equipamentoNome; }
    public int getDiasAtraso() { return diasAtraso; }
    public void setDiasAtraso(int diasAtraso) { this.diasAtraso = diasAtraso; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public StatusMulta getStatus() { return status; }
    public void setStatus(StatusMulta status) { this.status = status; }
}
