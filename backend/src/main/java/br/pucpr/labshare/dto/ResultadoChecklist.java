/*
 * ============================================================
 *  ResultadoChecklist.java  |  Camada: DTO (dados que voltam para a tela)
 *  Responsável na apresentação: Laura  |  Atividade: Q1 (Template Method ProcessoChecklist), Q2 (retirada/devolução)
 * ------------------------------------------------------------
 *  O que faz: Resultado devolvido depois da retirada ou da devolução: tipo da operação,
 *  reserva e equipamento já atualizados, e, se houver, a ocorrência gerada
 *  (RN08) e a multa por atraso (variabilidade lateFee). Mostrado na tela seguinte.
 *  Quem chama: ProcessoChecklist/ProcessoRetirada/ProcessoDevolucao (preenchem) e EmprestimoController (devolve).
 *  Chama: Reserva, Equipamento, Ocorrencia, Multa.
 * ============================================================
 */
package br.pucpr.labshare.dto;

import br.pucpr.labshare.model.Equipamento;
import br.pucpr.labshare.model.Multa;
import br.pucpr.labshare.model.Ocorrencia;
import br.pucpr.labshare.model.Reserva;

/** O que aconteceu depois da retirada/devolução (mostrado na tela seguinte). */
public class ResultadoChecklist {

    // "final": o tipo (retirada ou devolução) é definido uma vez no construtor e não muda.
    private final String tipo;
    private Reserva reserva;
    private Equipamento equipamento;
    private Ocorrencia ocorrencia;   // só na devolução com defeito
    private Multa multa;             // só se o cliente cobra multa e houve atraso
    private String mensagem;

    // Construtor: o processo (Retirada ou Devolução) informa qual operação foi feita.
    public ResultadoChecklist(String tipo) {
        this.tipo = tipo;
    }

    // Getters/setters: preenchidos pelo ProcessoChecklist e lidos pelo Jackson ao gerar o JSON de resposta.
    public String getTipo() { return tipo; }
    public Reserva getReserva() { return reserva; }
    public void setReserva(Reserva reserva) { this.reserva = reserva; }
    public Equipamento getEquipamento() { return equipamento; }
    public void setEquipamento(Equipamento equipamento) { this.equipamento = equipamento; }
    public Ocorrencia getOcorrencia() { return ocorrencia; }
    public void setOcorrencia(Ocorrencia ocorrencia) { this.ocorrencia = ocorrencia; }
    public Multa getMulta() { return multa; }
    public void setMulta(Multa multa) { this.multa = multa; }
    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }
}
