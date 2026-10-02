package br.pucpr.labshare.dto;

/** Corpo do POST /api/auth/login */
public record LoginRequest(String email, String senha) {
}
