/*
 * ============================================================
 *  AuthService.java  |  Camada: Service (regras de negócio)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (login / CRUD de Usuários)
 * ------------------------------------------------------------
 *  O que faz: faz o login (RF01/RF02): procura o usuário pelo e-mail, confere a
 *  senha digitada contra o hash BCrypt gravado (RNF04) e devolve os dados do
 *  usuário + do cliente (tenant) com os recursos ligados.
 *  Quem chama: AuthController (POST /api/auth/login, tela Login via AppContext).
 *  Chama: UsuarioDao.buscarPorEmail, UsuarioService.senhaConfere, TenantService.buscar.
 * ============================================================
 */
package br.pucpr.labshare.service;

import br.pucpr.labshare.dao.UsuarioDao;
import br.pucpr.labshare.dto.LoginResponse;
import br.pucpr.labshare.exception.RegraNegocioException;
import br.pucpr.labshare.model.Usuario;
import org.springframework.stereotype.Service;

/** RF01/RF02: autenticação por e-mail e senha e identificação do perfil. */
// @Service: o Spring cria uma única instância desta classe (bean) e a injeta onde for pedida.
@Service
public class AuthService {

    private final UsuarioDao usuarioDao;
    private final UsuarioService usuarioService;
    private final TenantService tenantService;

    // Injeção de dependência pelo construtor: o Spring passa os objetos prontos (não usamos "new").
    public AuthService(UsuarioDao usuarioDao, UsuarioService usuarioService, TenantService tenantService) {
        this.usuarioDao = usuarioDao;
        this.usuarioService = usuarioService;
        this.tenantService = tenantService;
    }

    // Botão "Entrar" da tela Login -> POST /api/auth/login -> aqui.
    // A mensagem de erro é a mesma para e-mail inexistente e senha errada (não revela qual dos dois falhou).
    public LoginResponse login(String email, String senha) {
        if (email == null || senha == null) {
            throw new RegraNegocioException("Informe e-mail e senha.");
        }
        Usuario usuario = usuarioDao.buscarPorEmail(email.trim())
                .filter(u -> usuarioService.senhaConfere(senha, u))   // compara com o hash BCrypt
                .orElseThrow(() -> new RegraNegocioException("E-mail ou senha incorretos."));
        // Resposta leva o usuário e o tenant (com features) para o front guardar no AppContext.
        return new LoginResponse(usuario, tenantService.buscar(usuario.getTenantId()));
    }
}
