/*
 * ============================================================
 *  IntegracaoController.java  |  Camada: Controller (API REST)
 *  Responsável na apresentação: Todos  |  Atividade: Medição (consultas aos 6 AIEs)
 * ------------------------------------------------------------
 *  O que faz: expõe, SOMENTE PARA LEITURA, os dados dos sistemas externos
 *  (Arquivos de Interface Externa). As telas usam estas rotas para preencher
 *  formulários (patrimônio, sala, grupo, matrícula, fornecedor) e para mostrar
 *  feriados na tela de disponibilidade. Não existe POST/PUT/DELETE aqui de
 *  propósito: quem mantém esses dados é o outro sistema, não o LabShare.
 *  Quem chama: telas EquipmentForm, Availability, CrudPage (configs) e Integracoes.
 * ============================================================
 */
package br.pucpr.labshare.controller;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.exception.NaoEncontradoException;
import br.pucpr.labshare.integracao.BemPatrimonial;
import br.pucpr.labshare.integracao.CalendarioAcademico;
import br.pucpr.labshare.integracao.Feriado;
import br.pucpr.labshare.integracao.FornecedorAssistencia;
import br.pucpr.labshare.integracao.GrupoPatrimonial;
import br.pucpr.labshare.integracao.PessoaInstitucional;
import br.pucpr.labshare.integracao.SalaEnsalamento;
import br.pucpr.labshare.integracao.SistemaAcademico;
import br.pucpr.labshare.integracao.SistemaCompras;
import br.pucpr.labshare.integracao.SistemaEnsalamento;
import br.pucpr.labshare.integracao.SistemaExterno;
import br.pucpr.labshare.integracao.SistemaPatrimonioBens;
import br.pucpr.labshare.integracao.SistemaPatrimonioGrupos;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/integracoes")
public class IntegracaoController {

    private final SistemaPatrimonioBens patrimonio;
    private final SistemaPatrimonioGrupos grupos;
    private final CalendarioAcademico calendario;
    private final SistemaEnsalamento ensalamento;
    private final SistemaAcademico academico;
    private final SistemaCompras compras;

    public IntegracaoController(SistemaPatrimonioBens patrimonio, SistemaPatrimonioGrupos grupos,
                                CalendarioAcademico calendario, SistemaEnsalamento ensalamento,
                                SistemaAcademico academico, SistemaCompras compras) {
        this.patrimonio = patrimonio;
        this.grupos = grupos;
        this.calendario = calendario;
        this.ensalamento = ensalamento;
        this.academico = academico;
        this.compras = compras;
    }

    /** GET /api/integracoes -> resumo dos sistemas externos (tela "Sistemas externos"). */
    @GetMapping
    public List<Map<String, Object>> sistemas(Contexto ctx) {
        return List.of(
                resumo("patrimonio", patrimonio, ctx), resumo("grupos-patrimoniais", grupos, ctx),
                resumo("feriados", calendario, ctx), resumo("salas", ensalamento, ctx),
                resumo("pessoas", academico, ctx), resumo("fornecedores", compras, ctx));
    }

    // ---------- AIE 1 e 2 (Laura): patrimônio e calendário ----------

    @GetMapping("/patrimonio")
    public List<BemPatrimonial> bens(Contexto ctx) {
        return patrimonio.listar(ctx.tenantId());
    }

    /** GET /api/integracoes/patrimonio/PAT-2024-001 (botão "Consultar no patrimônio"). */
    @GetMapping("/patrimonio/{numero}")
    public BemPatrimonial bem(@PathVariable String numero, Contexto ctx) {
        return patrimonio.buscar(ctx.tenantId(), numero)
                .orElseThrow(() -> new NaoEncontradoException("Patrimônio", numero));
    }

    /** GET /api/integracoes/feriados?inicio=2026-10-01&fim=2026-10-31 */
    @GetMapping("/feriados")
    public List<Feriado> feriados(@RequestParam(required = false) String inicio,
                                  @RequestParam(required = false) String fim, Contexto ctx) {
        if (inicio == null || fim == null) return calendario.listar(ctx.tenantId());
        return calendario.listarEntre(ctx.tenantId(), LocalDate.parse(inicio), LocalDate.parse(fim));
    }

    // ---------- AIE 3 e 4 (João): ensalamento e grupos patrimoniais ----------

    @GetMapping("/salas")
    public List<SalaEnsalamento> salas(Contexto ctx) {
        return ensalamento.listar(ctx.tenantId());
    }

    @GetMapping("/grupos-patrimoniais")
    public List<GrupoPatrimonial> gruposPatrimoniais(Contexto ctx) {
        return grupos.listar(ctx.tenantId());
    }

    // ---------- AIE 5 e 6 (Camilla): acadêmico/RH e compras ----------

    @GetMapping("/pessoas")
    public List<PessoaInstitucional> pessoas(Contexto ctx) {
        return academico.listar(ctx.tenantId());
    }

    @GetMapping("/fornecedores")
    public List<FornecedorAssistencia> fornecedores(Contexto ctx) {
        return compras.listar(ctx.tenantId());
    }

    private Map<String, Object> resumo(String chave, SistemaExterno<?> sistema, Contexto ctx) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("chave", chave);
        m.put("sistema", sistema.getNomeSistema());
        m.put("descricao", sistema.getDescricaoSistema());
        m.put("registros", sistema.listar(ctx.tenantId()).size());
        return m;
    }
}
