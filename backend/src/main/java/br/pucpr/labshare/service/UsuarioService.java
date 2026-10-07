/*
 * ============================================================
 *  UsuarioService.java  |  Camada: Service (regras de negócio)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (CRUD de Usuários), Q3 (reuso via CrudService)
 * ------------------------------------------------------------
 *  O que faz: regras do CRUD de usuários: campos obrigatórios, perfil Gestor
 *  só para clientes com aprovação (variabilidade), senha guardada apenas como
 *  hash BCrypt (RNF04) e conferência de senha no login.
 *  Quem chama: UsuarioController (/api/usuarios, GET ?perfil=...; tela CrudPage,
 *              EquipmentMaintenance) e AuthService (senhaConfere).
 *  Chama: UsuarioDao (via CrudService), TenantService, BCryptPasswordEncoder.
 * ============================================================
 */
package br.pucpr.labshare.service;

import br.pucpr.labshare.config.Contexto;
import br.pucpr.labshare.dao.UsuarioDao;
import br.pucpr.labshare.model.Perfil;
import br.pucpr.labshare.model.Tenant;
import br.pucpr.labshare.model.Usuario;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import br.pucpr.labshare.integracao.PessoaInstitucional;
import br.pucpr.labshare.integracao.SistemaAcademico;
import org.springframework.stereotype.Service;

import java.util.List;

// @Service: bean do Spring, injetado no UsuarioController e no AuthService.
@Service
public class UsuarioService extends CrudService<Usuario> {

    private final UsuarioDao usuarioDao;
    // BCrypt: gera um hash com "sal" aleatório; a mesma senha gera hashes diferentes e não dá para reverter.
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    // Injeção pelo construtor; o dao também vai para o CrudService (super).
    // AIE "Pessoas do Sistema Acadêmico/RH": só leitura, valida a matrícula.
    private final SistemaAcademico academico;

    public UsuarioService(UsuarioDao dao, HistoricoService historico, TenantService tenants,
                          SistemaAcademico academico) {
        super(dao, historico, tenants);
        this.usuarioDao = dao;
        this.academico = academico;
    }

    // Nome usado no histórico e nas mensagens.
    @Override
    protected String nomeEntidade() {
        return "usuario";
    }

    // Validação antes do INSERT/UPDATE (POST/PUT /api/usuarios).
    @Override
    protected void validar(Usuario u, Contexto ctx) {
        obrigatorio(u.getNome(), "Nome");
        obrigatorio(u.getEmail(), "E-mail");
        obrigatorio(u.getPerfil(), "Perfil");
        // Medição (AIE): se informada, a matrícula precisa existir e estar ativa no Sistema Acadêmico/RH.
        if (u.getMatricula() != null && u.getMatricula().isBlank()) u.setMatricula(null);
        if (u.getMatricula() != null) {
            PessoaInstitucional pessoa = academico.buscar(ctx.tenantId(), u.getMatricula())
                    .orElseThrow(() -> new br.pucpr.labshare.exception.RegraNegocioException(
                            "A matrícula " + u.getMatricula() + " não existe no Sistema Acadêmico/RH."));
            exigir(pessoa.estaAtiva(), "A matrícula " + u.getMatricula() + " está com situação " + pessoa.situacao() + " no Sistema Acadêmico.");
        }
        exigir(u.getEmail().contains("@"), "Informe um e-mail válido.");
        // VARIABILIDADE: o perfil Gestor só existe para clientes com aprovação de gestor
        if (u.getPerfil() == Perfil.GESTOR) {
            exigir(tenants.possuiRecurso(ctx.tenantId(), Tenant.APROVACAO_GESTOR),
                    "O perfil Gestor só está disponível para clientes com aprovação de gestor habilitada.");
        }
    }

    /** RNF04: a senha nunca é gravada em texto puro, só o hash BCrypt. */
    // Na criação a senha é obrigatória; na edição, campo vazio = manter o hash antigo.
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

    // DELETE /api/usuarios/{id}: impede o usuário logado de desativar a si mesmo.
    @Override
    protected void antesDeExcluir(Usuario existente, Contexto ctx) {
        exigir(!existente.getId().equals(ctx.usuarioId()), "Você não pode desativar o seu próprio usuário.");
    }

    // GET /api/usuarios?perfil=... (ex.: lista de técnicos na tela EquipmentMaintenance).
    public List<Usuario> listarPorPerfil(Perfil perfil, Contexto ctx) {
        return usuarioDao.listarPorPerfil(ctx.tenantId(), perfil);
    }

    // Usado no login (AuthService): compara a senha digitada com o hash salvo no banco.
    public boolean senhaConfere(String senhaDigitada, Usuario u) {
        return bcrypt.matches(senhaDigitada, u.getSenhaHash());
    }
}
