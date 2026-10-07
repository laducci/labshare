/*
 * ============================================================
 *  CalendarioAcademico.java  |  Camada: Integração  |  AIE: Feriados e recessos (Calendário Acadêmico)
 *  Responsável na apresentação: Laura  |  Atividade: Medição (Arquivo de Interface Externa)
 * ------------------------------------------------------------
 *  O que faz: lê os registros de "Feriados e recessos (Calendário Acadêmico)" (arquivo calendario-feriados.json).
 *  Chave de busca: dataTexto. O LabShare apenas consulta estes dados.
 * ============================================================
 */
package br.pucpr.labshare.integracao;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

// @Component: o Spring cria uma única instância e injeta onde for pedido.
@Component
public class CalendarioAcademico extends SistemaExterno<Feriado> {

    @Override
    protected String arquivo() {
        return "calendario-feriados.json";
    }

    @Override
    protected Class<Feriado> tipo() {
        return Feriado.class;
    }

    @Override
    protected String chave(Feriado registro) {
        return registro.dataTexto();
    }

    /** O dia é feriado/recesso? Usado para bloquear retirada e devolução nesses dias. */
    public Optional<Feriado> feriadoEm(String tenantId, LocalDate dia) {
        return dia == null ? Optional.empty() : buscar(tenantId, dia.toString());
    }

    /** Feriados dentro de um período (tela "Disponibilidade"). */
    public List<Feriado> listarEntre(String tenantId, LocalDate inicio, LocalDate fim) {
        return listar(tenantId).stream()
                .filter(f -> !f.data().isBefore(inicio) && !f.data().isAfter(fim))
                .toList();
    }
}
