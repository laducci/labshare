/*
 * ============================================================
 *  RelatorioService.java  |  Camada: Service (lógica dos relatórios)
 *  Responsável na apresentação: Laura (utilização, atrasos), João (categorias, locais),
 *                               Camilla (manutenções, multas)
 *  Atividade: Medição (6 Saídas Externas - SE)
 * ------------------------------------------------------------
 *  O que faz: monta os 6 relatórios. Em Pontos de Função, uma SAÍDA EXTERNA
 *  é um relatório que tem LÓGICA DE PROCESSAMENTO: cálculos, dados derivados
 *  ou totais que não estão gravados em nenhuma tabela. Aqui estão esses
 *  cálculos (taxa de ocupação, dias de atraso, multa estimada, % disponível,
 *  tempo médio de reparo, % pago). Dois relatórios também cruzam dados com
 *  sistemas externos (AIE): grupo patrimonial e sala do ensalamento.
 *  Quem chama: RelatorioController (/api/relatorios/...).
 *  Chama: RelatorioDao, ReservaDao, SeletorDeRegras (Strategy de multa),
 *         SistemaPatrimonioGrupos e SistemaEnsalamento (AIEs), TenantService.
 * ============================================================
 */
package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.RelatorioDao;
import br.pucpr.labshare.dao.ReservaDao;
import br.pucpr.labshare.dto.Relatorio;
import br.pucpr.labshare.integracao.SistemaEnsalamento;
import br.pucpr.labshare.integracao.SistemaPatrimonioGrupos;
import br.pucpr.labshare.model.Reserva;
import br.pucpr.labshare.model.StatusReserva;
import br.pucpr.labshare.model.Tenant;
import br.pucpr.labshare.variabilidade.CalculoMulta;
import br.pucpr.labshare.variabilidade.SeletorDeRegras;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class RelatorioService {

    private final RelatorioDao dao;
    private final ReservaDao reservaDao;
    private final SeletorDeRegras seletor;
    private final TenantService tenants;
    private final SistemaPatrimonioGrupos grupos;
    private final SistemaEnsalamento ensalamento;

    public RelatorioService(RelatorioDao dao, ReservaDao reservaDao, SeletorDeRegras seletor, TenantService tenants,
                            SistemaPatrimonioGrupos grupos, SistemaEnsalamento ensalamento) {
        this.dao = dao;
        this.reservaDao = reservaDao;
        this.seletor = seletor;
        this.tenants = tenants;
        this.grupos = grupos;
        this.ensalamento = ensalamento;
    }

    // ===================== Laura =====================

    /** SE 1 — Utilização por equipamento: taxa de ocupação = dias reservados / dias do período. */
    public Relatorio utilizacaoPorEquipamento(Contexto ctx, LocalDate inicio, LocalDate fim) {
        long diasPeriodo = ChronoUnit.DAYS.between(inicio, fim) + 1;
        List<Map<String, Object>> linhas = new ArrayList<>();
        long reservas = 0, retiradas = 0;
        double somaTaxas = 0;
        for (Map<String, Object> r : dao.utilizacaoPorEquipamento(ctx.tenantId(), inicio, fim)) {
            long dias = num(r, "dias_ocupados").longValue();
            double taxa = percentual(dias, diasPeriodo);                   // cálculo (dado derivado)
            Map<String, Object> l = new LinkedHashMap<>();
            l.put("equipamento", r.get("nome"));
            l.put("patrimonio", r.get("patrimonio"));
            l.put("categoria", r.get("categoria"));
            l.put("reservas", num(r, "reservas").longValue());
            l.put("retiradas", num(r, "retiradas").longValue());
            l.put("diasOcupados", dias);
            l.put("taxaOcupacao", taxa);
            l.put("classificacao", taxa >= 50 ? "Alta" : taxa >= 20 ? "Média" : "Baixa");
            linhas.add(l);
            reservas += num(r, "reservas").longValue();
            retiradas += num(r, "retiradas").longValue();
            somaTaxas += taxa;
        }
        Map<String, Object> totais = new LinkedHashMap<>();
        totais.put("equipamentos", linhas.size());
        totais.put("diasNoPeriodo", diasPeriodo);
        totais.put("reservas", reservas);
        totais.put("retiradas", retiradas);
        totais.put("ocupacaoMedia", linhas.isEmpty() ? 0 : arredondar(somaTaxas / linhas.size()));
        return new Relatorio("utilizacao", "Utilização por equipamento",
                "Reservas, retiradas e taxa de ocupação de cada equipamento no período.",
                inicio, fim, linhas, totais, LocalDateTime.now());
    }

    /** SE 2 — Reservas em atraso: dias de atraso e multa estimada pela estratégia do cliente. */
    public Relatorio reservasEmAtraso(Contexto ctx) {
        LocalDate hoje = LocalDate.now();
        CalculoMulta calculo = seletor.para(ctx.tenantId()).multa();     // Strategy (variabilidade)
        List<Map<String, Object>> linhas = new ArrayList<>();
        long diasTotal = 0;
        BigDecimal multaTotal = BigDecimal.ZERO;
        for (Reserva r : reservaDao.listarPorStatus(ctx.tenantId(), StatusReserva.EM_USO)) {
            if (!r.getDataFim().isBefore(hoje)) continue;                 // ainda no prazo
            long dias = r.calcularDiasDeAtraso(hoje);                       // cálculo
            BigDecimal multa = calculo.calcular(dias);                      // cálculo
            Map<String, Object> l = new LinkedHashMap<>();
            l.put("usuario", r.getUsuarioNome());
            l.put("equipamento", r.getEquipamentoNome());
            l.put("local", r.getLocalNome());
            l.put("devolucaoPrevista", r.getDataFim());
            l.put("diasAtraso", dias);
            l.put("multaEstimada", multa);
            linhas.add(l);
            diasTotal += dias;
            multaTotal = multaTotal.add(multa);
        }
        linhas.sort((a, b) -> Long.compare((Long) b.get("diasAtraso"), (Long) a.get("diasAtraso")));
        Map<String, Object> totais = new LinkedHashMap<>();
        totais.put("reservasAtrasadas", linhas.size());
        totais.put("diasDeAtraso", diasTotal);
        totais.put("multaEstimadaTotal", multaTotal);
        totais.put("regraDeMulta", calculo.descricao());
        return new Relatorio("atrasos", "Reservas em atraso",
                "Empréstimos não devolvidos no prazo, com dias de atraso e multa estimada.",
                null, hoje, linhas, totais, LocalDateTime.now());
    }

    // ===================== João =====================

    /** SE 3 — Equipamentos por categoria, com o nome do grupo vindo do Sistema de Patrimônio (AIE). */
    public Relatorio equipamentosPorCategoria(Contexto ctx) {
        List<Map<String, Object>> linhas = new ArrayList<>();
        long total = 0, disponiveis = 0;
        for (Map<String, Object> r : dao.equipamentosPorCategoria(ctx.tenantId())) {
            long t = num(r, "total").longValue();
            long d = num(r, "disponiveis").longValue();
            String codigoGrupo = (String) r.get("grupo_patrimonial");
            Map<String, Object> l = new LinkedHashMap<>();
            l.put("categoria", r.get("categoria"));
            l.put("grupoPatrimonial", grupos.buscar(ctx.tenantId(), codigoGrupo)
                    .map(g -> g.codigo() + " - " + g.nome()).orElse("—"));        // dado do AIE
            l.put("total", t);
            l.put("disponiveis", d);
            l.put("emprestados", num(r, "reservados").longValue() + num(r, "em_uso").longValue());
            l.put("emManutencao", num(r, "em_manutencao").longValue());
            l.put("indisponiveis", num(r, "indisponiveis").longValue());
            l.put("percentualDisponivel", percentual(d, t));                       // cálculo
            linhas.add(l);
            total += t;
            disponiveis += d;
        }
        Map<String, Object> totais = new LinkedHashMap<>();
        totais.put("categorias", linhas.size());
        totais.put("equipamentos", total);
        totais.put("disponiveis", disponiveis);
        totais.put("percentualDisponivelGeral", percentual(disponiveis, total));
        return new Relatorio("categorias", "Equipamentos por categoria",
                "Situação do acervo agrupada por categoria e grupo patrimonial.",
                null, LocalDate.now(), linhas, totais, LocalDateTime.now());
    }

    /** SE 4 — Inventário por local, com bloco e capacidade vindos do Sistema de Ensalamento (AIE). */
    public Relatorio inventarioPorLocal(Contexto ctx) {
        List<Map<String, Object>> linhas = new ArrayList<>();
        long total = 0, disponiveis = 0;
        for (Map<String, Object> r : dao.inventarioPorLocal(ctx.tenantId())) {
            long t = num(r, "total").longValue();
            long d = num(r, "disponiveis").longValue();
            String codigoSala = (String) r.get("codigo_sala");
            Map<String, Object> l = new LinkedHashMap<>();
            l.put("local", r.get("local"));
            ensalamento.buscar(ctx.tenantId(), codigoSala).ifPresentOrElse(s -> {   // dados do AIE
                l.put("sala", s.codigo() + " - " + s.bloco() + ", " + s.andar());
                l.put("capacidade", s.capacidade());
            }, () -> {
                l.put("sala", "—");
                l.put("capacidade", null);
            });
            l.put("total", t);
            l.put("disponiveis", d);
            l.put("emprestados", num(r, "emprestados").longValue());
            l.put("emManutencao", num(r, "em_manutencao").longValue());
            l.put("percentualDisponivel", percentual(d, t));                       // cálculo
            linhas.add(l);
            total += t;
            disponiveis += d;
        }
        Map<String, Object> totais = new LinkedHashMap<>();
        totais.put("locais", linhas.size());
        totais.put("equipamentos", total);
        totais.put("disponiveis", disponiveis);
        totais.put("percentualDisponivelGeral", percentual(disponiveis, total));
        return new Relatorio("locais", "Inventário por local",
                "Quantidade de equipamentos em cada laboratório/sala e sua situação.",
                null, LocalDate.now(), linhas, totais, LocalDateTime.now());
    }

    // ===================== Camilla =====================

    /** SE 5 — Indicadores de manutenção: tempo médio de reparo (MTTR) por equipamento. */
    public Relatorio indicadoresManutencao(Contexto ctx, LocalDate inicio, LocalDate fim) {
        List<Map<String, Object>> linhas = new ArrayList<>();
        long total = 0, concluidas = 0, diasReparo = 0, externas = 0;
        for (Map<String, Object> r : dao.indicadoresManutencao(ctx.tenantId(), inicio, fim)) {
            long c = num(r, "concluidas").longValue();
            long dias = num(r, "dias_reparo").longValue();
            Map<String, Object> l = new LinkedHashMap<>();
            l.put("equipamento", r.get("nome"));
            l.put("patrimonio", r.get("patrimonio"));
            l.put("manutencoes", num(r, "total").longValue());
            l.put("concluidas", c);
            l.put("emAndamento", num(r, "em_andamento").longValue());
            l.put("comAssistenciaExterna", num(r, "com_assistencia_externa").longValue());
            l.put("tempoMedioReparoDias", c == 0 ? null : arredondar((double) dias / c));   // cálculo
            linhas.add(l);
            total += num(r, "total").longValue();
            concluidas += c;
            diasReparo += dias;
            externas += num(r, "com_assistencia_externa").longValue();
        }
        Map<String, Object> totais = new LinkedHashMap<>();
        totais.put("manutencoes", total);
        totais.put("concluidas", concluidas);
        totais.put("comAssistenciaExterna", externas);
        totais.put("tempoMedioReparoGeralDias", concluidas == 0 ? 0 : arredondar((double) diasReparo / concluidas));
        totais.put("percentualConcluido", percentual(concluidas, total));
        return new Relatorio("manutencoes", "Indicadores de manutenção",
                "Manutenções por equipamento no período e tempo médio de reparo (MTTR).",
                inicio, fim, linhas, totais, LocalDateTime.now());
    }

    /** SE 6 — Multas por período (só para clientes com o recurso lateFee: VARIABILIDADE). */
    public Relatorio multasPorPeriodo(Contexto ctx, LocalDate inicio, LocalDate fim) {
        tenants.exigirRecurso(ctx.tenantId(), Tenant.MULTA_ATRASO);
        List<Map<String, Object>> linhas = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO, pago = BigDecimal.ZERO, aberto = BigDecimal.ZERO;
        long quantidade = 0;
        for (Map<String, Object> r : dao.multasPorUsuario(ctx.tenantId(), inicio, fim)) {
            BigDecimal t = decimal(r, "total");
            BigDecimal p = decimal(r, "pago");
            Map<String, Object> l = new LinkedHashMap<>();
            l.put("usuario", r.get("nome"));
            l.put("email", r.get("email"));
            l.put("multas", num(r, "quantidade").longValue());
            l.put("diasAtraso", num(r, "dias_atraso").longValue());
            l.put("total", t);
            l.put("pago", p);
            l.put("emAberto", decimal(r, "em_aberto"));
            l.put("percentualPago", t.signum() == 0 ? 0 : arredondar(p.doubleValue() * 100 / t.doubleValue()));
            linhas.add(l);
            quantidade += num(r, "quantidade").longValue();
            total = total.add(t);
            pago = pago.add(p);
            aberto = aberto.add(decimal(r, "em_aberto"));
        }
        Map<String, Object> totais = new LinkedHashMap<>();
        totais.put("usuarios", linhas.size());
        totais.put("multas", quantidade);
        totais.put("valorTotal", total);
        totais.put("valorPago", pago);
        totais.put("valorEmAberto", aberto);
        totais.put("percentualPago", total.signum() == 0 ? 0 : arredondar(pago.doubleValue() * 100 / total.doubleValue()));
        return new Relatorio("multas", "Multas por período",
                "Multas por atraso agrupadas por usuário (devoluções dentro do período).",
                inicio, fim, linhas, totais, LocalDateTime.now());
    }

    // ---------- utilitários ----------

    private static Number num(Map<String, Object> linha, String coluna) {
        Object v = linha.get(coluna);
        return v == null ? 0 : (Number) v;
    }

    private static BigDecimal decimal(Map<String, Object> linha, String coluna) {
        Object v = linha.get(coluna);
        return v == null ? BigDecimal.ZERO : new BigDecimal(v.toString()).setScale(2, RoundingMode.HALF_UP);
    }

    private static double percentual(long parte, long todo) {
        return todo == 0 ? 0 : arredondar(parte * 100.0 / todo);
    }

    private static double arredondar(double valor) {
        return BigDecimal.valueOf(valor).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
