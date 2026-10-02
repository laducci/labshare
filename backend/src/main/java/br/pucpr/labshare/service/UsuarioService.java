package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.UsuarioDao;
import br.pucpr.labshare.model.Perfil;
import br.pucpr.labshare.model.Tenant;
import br.pucpr.labshare.model.Usuario;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService extends CrudService<Usuario> {

    private final UsuarioDao usuarioDao;
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioDao dao, HistoricoService historico, TenantService tenants) {
        super(dao, historico, tenants);
        this.usuarioDao = dao;
    }

    @Override
    protected String nomeEntidade() {
        return "usuario";
    }

    @Override
    protected void validar(Usuario u, Contexto ctx) {
        obrigatorio(u.getNome(), "Nome");
        obrigatorio(u.getEmail(), "E-mail");
        obrigatorio(u.getPerfil(), "Perfil");
        exigir(u.getEmail().contains("@"), "Informe um e-mail válido.");
        // VARIABILIDADE: o perfil Gestor só existe para clientes com aprovação de gestor
        if (u.getPerfil() == Perfil.GESTOR) {
            exigir(tenants.possuiRecurso(ctx.tenantId(), Tenant.APROVACAO_GESTOR),
                    "O perfil Gestor só está disponível para clientes com aprovação de gestor habilitada.");
        }
    }

    /** RNF04: a senha nunca é gravada em texto puro, só o hash BCrypt. */
    @Override
    protected void antesDeSalvar(Usuario u, Usuario existente, Contexto ctx) {
        boolean informouSenha = u.getSenha() != null && !u.getSenha().isBlank();
        if (existente == null) {
            exigir(informouSenha, "Informe uma senha para o novo usuário.");
        }
        if (informouSenha) {
            exigir(u.getSenha().length() >= 6, "A senha deve ter pelo menos 6 caracteres.");
            u.setSenhaHash(bcrypt.encode(u.getSenha()));
        } else {
            u.setSenhaHash(existente.getSenhaHash()); // edição sem trocar a senha
        }
    }

    @Override
    protected void antesDeExcluir(Usuario existente, Contexto ctx) {
        exigir(!existente.getId().equals(ctx.usuarioId()), "Você não pode desativar o seu próprio usuário.");
    }

    public List<Usuario> listarPorPerfil(Perfil perfil, Contexto ctx) {
        return usuarioDao.listarPorPerfil(ctx.tenantId(), perfil);
    }

    public boolean senhaConfere(String senhaDigitada, Usuario u) {
        return bcrypt.matches(senhaDigitada, u.getSenhaHash());
    }
}
