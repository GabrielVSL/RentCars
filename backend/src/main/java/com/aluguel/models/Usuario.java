package com.aluguel.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.*;

@Serdeable
@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.JOINED) // Cria tabelas ligadas pelo ID
@JsonIgnoreProperties(ignoreUnknown = true) // Ignora campos extras como confirmPassword
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private String role; // ROLE_CLIENTE, ROLE_EMPRESA, ROLE_BANCO

    private String nome;
    private String endereco;

    public Usuario() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
}