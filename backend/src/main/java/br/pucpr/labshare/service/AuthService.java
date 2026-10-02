package br.pucpr.labshare.service;

import br.pucpr.labshare.dao.UsuarioDao;
import br.pucpr.labshare.dto.LoginResponse;
import br.pucpr.labshare.exception.RegraNegocioException;
import br.pucpr.labshare.model.Usuario;
import org.springframework.stereotype.Service;

/** RF01/RF02: autenticação por e-mail e senha e identificação do perfil. */
@Service
public class AuthService {

    private final UsuarioDao usuarioDao;
    private final UsuarioService usuarioService;
    private final TenantService tenantService;

    public AuthService(UsuarioDao usuarioDao, UsuarioService usuarioService, TenantService tenantService) {
        this.usuarioDao = usuarioDao;
        this.usuarioService = usuarioService;
        this.tenantService = tenantService;
    }

    public LoginResponse login(String email, String senha) {
        if (email == null || senha == null) {
            throw new RegraNegocioException("Informe e-mail e senha.");
        }
        Usuario usuario = usuarioDao.buscarPorEmail(email.trim())
                .filter(u -> usuarioService.senhaConfere(senha, u))   // compara com o hash BCrypt
                .orElseThrow(() -> new RegraNegocioException("E-mail ou senha incorretos."));
        return new LoginResponse(usuario, tenantService.buscar(usuario.getTenantId()));
    }
}
