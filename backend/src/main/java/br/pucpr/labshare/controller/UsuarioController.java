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

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController extends CrudController<Usuario> {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @Override
    protected CrudService<Usuario> service() {
        return service;
    }

    /** GET /api/usuarios?perfil=manutencao  (ex.: lista de responsáveis) */
    @GetMapping(params = "perfil")
    public List<Usuario> porPerfil(@RequestParam String perfil, Contexto ctx) {
        return service.listarPorPerfil(Perfil.de(perfil), ctx);
    }
}
