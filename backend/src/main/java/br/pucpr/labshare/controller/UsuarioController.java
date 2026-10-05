/*
 * ============================================================
 *  UsuarioController.java  |  Camada: Controller (API REST)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (CRUD de Usuários), Q3 (reuso via CrudController)
 * ------------------------------------------------------------
 *  O que faz: expõe /api/usuarios. O CRUD vem herdado do CrudController (a senha recebida é
 *  guardada como hash BCrypt pelo UsuarioService - RNF04). Rota extra: filtrar usuários por perfil.
 *  Quem chama: CrudPage (config "usuarios"), EquipmentMaintenance (lista de responsáveis
 *  /usuarios?perfil=manutencao) e o select de usuário na config de reservas.
 *  Chama: UsuarioService -> UsuarioDao -> tabela usuario.
 * ============================================================
 */
package br.pucpr.labshare.controller;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.model.Perfil;
import br.pucpr.labshare.model.Usuario;
import br.pucpr.labshare.service.CrudService;
import br.pucpr.labshare.service.UsuarioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// @RestController: responde HTTP com JSON. @RequestMapping: prefixo /api/usuarios.
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController extends CrudController<Usuario> {

    private final UsuarioService service;

    // Injeção pelo construtor: o Spring entrega o UsuarioService (@Service).
    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    // Gancho do CrudController: as rotas herdadas usam o UsuarioService.
    @Override
    protected CrudService<Usuario> service() {
        return service;
    }

    /** GET /api/usuarios?perfil=manutencao  (ex.: lista de responsáveis) */
    // "params = perfil": só cai aqui quando a URL tem ?perfil=...; sem ele vale o listar() herdado.
    // Perfil.de converte o texto no enum Perfil (valor inválido -> 400 "Dados inválidos").
    @GetMapping(params = "perfil")
    public List<Usuario> porPerfil(@RequestParam String perfil, Contexto ctx) {
        return service.listarPorPerfil(Perfil.de(perfil), ctx);
    }
}
