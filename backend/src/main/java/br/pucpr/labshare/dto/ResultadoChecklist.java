package br.pucpr.labshare.dto;

import br.pucpr.labshare.model.Equipamento;
import br.pucpr.labshare.model.Multa;
import br.pucpr.labshare.model.Ocorrencia;
import br.pucpr.labshare.model.Reserva;

/** O que aconteceu depois da retirada/devolução (mostrado na tela seguinte). */
public class ResultadoChecklist {

    private final String tipo;
    private Reserva reserva;
    private Equipamento equipamento;
    private Ocorrencia ocorrencia;   // só na devolução com defeito
    private Multa multa;             // só se o cliente cobra multa e houve atraso
    private String mensagem;

    public ResultadoChecklist(String tipo) {
        this.tipo = tipo;
    }

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
