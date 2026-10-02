package br.pucpr.labshare.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/** Pessoa que acessa o sistema (aluno, técnico, manutenção, gestor, admin). */
public class Usuario extends EntidadeBase {

    private String nome;
    private String email;
    private Perfil perfil;

    /** Senha em texto puro: só chega do frontend no cadastro; NUNCA é devolvida nem salva. */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    /** O que vai para o banco é apenas o hash BCrypt (RNF04). */
    @JsonIgnore
    private String senhaHash;

    public String getPrimeiroNome() {
        if (nome == null || nome.isBlank()) return "";
        return nome.trim().split("\\s+")[0];
    }

    public boolean temPerfil(Perfil esperado) {
        return perfil == esperado;
    }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Perfil getPerfil() { return perfil; }
    public void setPerfil(Perfil perfil) { this.perfil = perfil; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getSenhaHash() { return senhaHash; }
    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }
}
