package com.aluguel.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.JOINED)
@JsonIgnoreProperties(ignoreUnknown = true)
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    @Column(nullable = false)
    private String role; // ROLE_CLIENTE, ROLE_EMPRESA, ROLE_BANCO, ROLE_ADMIN

    private String nome;
    private String endereco;

    // --- 💳 MOTOR FINANCEIRO APEXPAY ---
    @Column(nullable = false)
    private BigDecimal saldoCarteira = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal totalDepositadoHistorico = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String statusFinanceiro = "REGULAR"; // REGULAR, INADIMPLENTE

    // --- 🏎️ DADOS DE HABILITAÇÃO & PILOTAGEM ---
    @Column(length = 20)
    private String cnhNumero;

    @Column(length = 5)
    private String cnhCategoria; // B, C, D, E

    @Column
    private LocalDate dataNascimento;

    public Usuario() {}

    // Regra de Negócio: Cliente com saldo negativo ou marcado como inadimplente não pode criar reservas
    public boolean isInadimplente() {
        return "INADIMPLENTE".equalsIgnoreCase(statusFinanceiro) || (saldoCarteira != null && saldoCarteira.compareTo(BigDecimal.ZERO) < 0);
    }

    // Regra de Negócio: Programa de Fidelidade ApexPay por Depósito Acumulado
    public String getTierFidelidade() {
        if (totalDepositadoHistorico == null) return "BRONZE";
        if (totalDepositadoHistorico.compareTo(new BigDecimal("50000")) >= 0) return "APEX_BLACK";
        if (totalDepositadoHistorico.compareTo(new BigDecimal("25000")) >= 0) return "GOLD";
        if (totalDepositadoHistorico.compareTo(new BigDecimal("10000")) >= 0) return "SILVER";
        return "BRONZE";
    }

    public BigDecimal getFatorDesconto() {
        String tier = getTierFidelidade();
        return switch (tier) {
            case "APEX_BLACK" -> new BigDecimal("0.15"); // 15% de desconto
            case "GOLD" -> new BigDecimal("0.10");       // 10% de desconto
            case "SILVER" -> new BigDecimal("0.05");     // 5% de desconto
            default -> BigDecimal.ZERO;
        };
    }

    public void creditarSaldo(BigDecimal valor) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor de depósito deve ser positivo");
        }
        this.saldoCarteira = (this.saldoCarteira != null ? this.saldoCarteira : BigDecimal.ZERO).add(valor);
        this.totalDepositadoHistorico = (this.totalDepositadoHistorico != null ? this.totalDepositadoHistorico : BigDecimal.ZERO).add(valor);
        if (this.saldoCarteira.compareTo(BigDecimal.ZERO) >= 0) {
            this.statusFinanceiro = "REGULAR";
        }
    }

    public void debitarSaldo(BigDecimal valor) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor de débito deve ser positivo");
        }
        this.saldoCarteira = (this.saldoCarteira != null ? this.saldoCarteira : BigDecimal.ZERO).subtract(valor);
        if (this.saldoCarteira.compareTo(BigDecimal.ZERO) < 0) {
            this.statusFinanceiro = "INADIMPLENTE";
        }
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    @JsonIgnore
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public BigDecimal getSaldoCarteira() { return saldoCarteira; }
    public void setSaldoCarteira(BigDecimal saldoCarteira) { this.saldoCarteira = saldoCarteira; }
    public BigDecimal getTotalDepositadoHistorico() { return totalDepositadoHistorico; }
    public void setTotalDepositadoHistorico(BigDecimal totalDepositadoHistorico) { this.totalDepositadoHistorico = totalDepositadoHistorico; }
    public String getStatusFinanceiro() { return statusFinanceiro; }
    public void setStatusFinanceiro(String statusFinanceiro) { this.statusFinanceiro = statusFinanceiro; }
    public String getCnhNumero() { return cnhNumero; }
    public void setCnhNumero(String cnhNumero) { this.cnhNumero = cnhNumero; }
    public String getCnhCategoria() { return cnhCategoria; }
    public void setCnhCategoria(String cnhCategoria) { this.cnhCategoria = cnhCategoria; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
}
