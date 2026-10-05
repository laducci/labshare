/*
 * ============================================================
 *  MultaPorDiaDeAtraso.java  |  Camada: Variabilidade (Strategy concreta)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Strategy CalculoMulta + Singleton), Q2 (variabilidade)
 * ------------------------------------------------------------
 *  O que faz: estratégia de multa do cliente com o recurso "lateFee" ligado
 *  (Escola Técnica): multa = valor diário x dias de atraso.
 *  Quem chama: SeletorDeRegras (cria); ProcessoDevolucao e MultaService (usam).
 *  Chama: ConfiguracaoEmprestimo.getInstance() (Singleton com o valor diário).
 * ============================================================
 */
package br.pucpr.labshare.variabilidade;

import br.pucpr.labshare.config.ConfiguracaoEmprestimo;

import java.math.BigDecimal;

/**
 * Strategy concreta: valor diário x dias de atraso.
 * O valor diário vem do Singleton ConfiguracaoEmprestimo (padrões trabalhando juntos).
 */
public class MultaPorDiaDeAtraso implements CalculoMulta {

    // Sem atraso (0 ou negativo) não há multa; senão multiplica valor diário pelos dias.
    @Override
    public BigDecimal calcular(long diasDeAtraso) {
        if (diasDeAtraso <= 0) {
            return BigDecimal.ZERO;
        }
        // SINGLETON: getInstance() devolve sempre a mesma instância de configuração.
        BigDecimal valorDiario = ConfiguracaoEmprestimo.getInstance().getValorMultaDiaria();
        return valorDiario.multiply(BigDecimal.valueOf(diasDeAtraso));
    }

    // Texto exibido na tela "Confirmar reserva" (ex.: "Multa de R$ 5.00 por dia de atraso.").
    @Override
    public String descricao() {
        return "Multa de R$ " + ConfiguracaoEmprestimo.getInstance().getValorMultaDiaria() + " por dia de atraso.";
    }
}
