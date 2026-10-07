/*
 * ============================================================
 *  Usuario.java  |  Camada: Model (entidade / tabela usuario)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (CRUD de Usuários / login), RNF04 / RNF05
 * ------------------------------------------------------------
 *  O que faz: Pessoa que acessa o sistema, com nome, e-mail e perfil (RNF05). A senha só
 *  trafega na entrada (cadastro); no banco fica apenas o hash BCrypt (RNF04),
 *  e nenhum dos dois é devolvido no JSON.
 *  Quem chama: UsuarioDao, UsuarioService, UsuarioController, AuthService (login).   Chama: Perfil.
 * ============================================================
 */
package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/** Pessoa que acessa o sistema (aluno, técnico, manutenção, gestor, admin). */
// Herda id, tenantId e ativo de EntidadeBase.
public class Usuario extends EntidadeBase {

    private String nome;
    private String email;
    // AIE (Medição): matrícula (Sistema Acadêmico/RH) do sistema externo; validado pelo LeitorSistemaExterno.
    private String matricula;
    private Perfil perfil;

    /** Senha em texto puro: só chega do frontend no cadastro; NUNCA é devolvida nem salva. */
    // WRITE_ONLY: o Jackson LÊ a senha do JSON recebido, mas nunca a ESCREVE no JSON de resposta.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    /** O que vai para o banco é apenas o hash BCrypt (RNF04). */
    // @JsonIgnore: o hash não entra nem sai pelo JSON; só o DAO o lê/grava.
    @JsonIgnore
    private String senhaHash;

    // Vai no JSON como "primeiroNome" (usado em "Olá, Ana" na Home e no avatar da Sidebar).
    // split("\\s+") separa por um ou mais espaços.
    public String getPrimeiroNome() {
        if (nome == null || nome.isBlank()) return "";
        return nome.trim().split("\\s+")[0];
    }

    // Auxiliar de permissão: compara o perfil do usuário com o esperado.
    public boolean temPerfil(Perfil esperado) {
        return perfil == esperado;
    }

    // Getters e setters: usados pelo Jackson para converter objeto <-> JSON (e pelos DAOs/RowMapper ao ler do banco).
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Perfil getPerfil() { return perfil; }
    public void setPerfil(Perfil perfil) { this.perfil = perfil; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getSenhaHash() { return senhaHash; }
    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }
}
