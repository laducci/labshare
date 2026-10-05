/*
 * ============================================================
 *  SemMulta.java  |  Camada: Variabilidade (Strategy concreta)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Strategy CalculoMulta), Q2 (variabilidade)
 * ------------------------------------------------------------
 *  O que faz: estratégia de multa para clientes SEM o recurso "lateFee"
 *  (Universidade e Empresa): o atraso nunca gera cobrança (valor zero),
 *  então o ProcessoDevolucao não grava nenhuma multa.
 *  Quem chama: SeletorDeRegras (cria); ProcessoDevolucao e MultaService (usam).   Chama: nada.
 * ============================================================
 */
package br.pucpr.labshare.variabilidade;

import java.math.BigDecimal;

/** Strategy concreta: atraso não gera cobrança. */
public class SemMulta implements CalculoMulta {

    // Sempre zero, independentemente dos dias de atraso.
    @Override
    public BigDecimal calcular(long diasDeAtraso) {
        return BigDecimal.ZERO;
    }

    // Texto exibido na tela "Confirmar reserva".
    @Override
    public String descricao() {
        return "Este cliente não cobra multa por atraso.";
    }
}
