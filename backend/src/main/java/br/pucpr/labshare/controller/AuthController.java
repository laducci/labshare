package br.pucpr.labshare.controller;

import br.pucpr.labshare.dto.LoginRequest;
import br.pucpr.labshare.dto.LoginResponse;
import br.pucpr.labshare.service.AuthService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/auth/login  { "email": "lucas@email.com", "senha": "123456" } */
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest pedido) {
        return authService.login(pedido.email(), pedido.senha());
    }
}
