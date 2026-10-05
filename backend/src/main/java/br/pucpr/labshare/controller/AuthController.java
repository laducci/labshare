/*
 * ============================================================
 *  AuthController.java  |  Camada: Controller (API REST de login)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (login / telas com banco)
 * ------------------------------------------------------------
 *  O que faz: recebe o e-mail e a senha digitados na tela de Login e devolve os dados do
 *  usuário e do seu cliente (tenant). Não estende CrudController porque login não é um CRUD.
 *  Quem chama: AppContext.jsx (função login) -> api.post('/auth/login') -> POST /api/auth/login.
 *  Chama: AuthService.login (busca usuário por e-mail e confere a senha com BCrypt - RNF04).
 * ============================================================
 */
package br.pucpr.labshare.controller;

import br.pucpr.labshare.dto.LoginRequest;
import br.pucpr.labshare.dto.LoginResponse;
import br.pucpr.labshare.service.AuthService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// @RestController: diz ao Spring que esta classe atende requisições HTTP e que o retorno
// de cada método vira JSON automaticamente (não é uma página HTML).
// @RequestMapping("/api/auth"): prefixo de URL de todas as rotas desta classe.
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    // Injeção de dependência pelo construtor: o Spring cria o AuthService (@Service) e entrega aqui.
    // Assim o controller não faz "new", e o campo pode ser final (não muda depois de criado).
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/auth/login  { "email": "lucas@email.com", "senha": "123456" } */
    // Chamado pelo botão "Entrar" da tela de Login. @RequestBody converte o JSON em LoginRequest (record).
    // Esta é a única rota que NÃO recebe Contexto: antes do login o front ainda não tem X-Tenant-Id.
    // Se e-mail/senha estiverem errados, o Service lança RegraNegocioException -> HTTP 400 {erro}.
    // A resposta (LoginResponse = usuário + tenant com recursos ligados) não leva o hash da senha
    // (campo senhaHash tem @JsonIgnore em Usuario); o front guarda os dois no AppContext.
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest pedido) {
        return authService.login(pedido.email(), pedido.senha());
    }
}
