package br.pucpr.labshare.dto;

import br.pucpr.labshare.model.Tenant;
import br.pucpr.labshare.model.Usuario;

/** Resposta do login: o usuário e o cliente dele (com os recursos ligados). */
public record LoginResponse(Usuario usuario, Tenant tenant) {
}
