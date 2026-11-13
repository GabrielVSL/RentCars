package com.aluguel.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Serdeable
@Entity
@Table(name = "automoveis")
public class Automovel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String matricula; 

    @Column(nullable = false)
    private Integer ano;      

    @Column(nullable = false)
    private String marca;     

    @Column(nullable = false)
    private String modelo;    

    @Column(nullable = false, unique = true)
    private String placa;     

    @Column
    private String imageUrl; // URL vinda do Cloudinary ou asset local

    @Column(nullable = false)
    private BigDecimal precoPorDia;

    @ManyToOne
    @JoinColumn(name = "proprietario_id", nullable = false)
    @JsonIgnoreProperties({"senha", "saldoCarteira", "totalDepositadoHistorico", "statusFinanceiro", "rendimentos", "cpf", "rg", "cnhNumero", "cnhCategoria", "dataNascimento"})
    private Usuario proprietario;

    // --- 🏎️ CAMPOS DO APEX TRACK EXPERIENCE ---
    @ManyToOne
    @JoinColumn(name = "circuito_id")
    private Circuito circuito;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "automovel_circuitos",
        joinColumns = @JoinColumn(name = "automovel_id"),
        inverseJoinColumns = @JoinColumn(name = "circuito_id")
    )
    private Set<Circuito> circuitosDisponiveis = new LinkedHashSet<>();

    @Column
    private Integer potenciaCv;

    @Column(length = 20)
    private String aceleracao0a100;

    @Column(length = 30)
    private String velocidadeMaxima;

    @Column(length = 30)
    private String categoria; // GT3, HYPERCAR, TRACK_PACK

    @Column(nullable = false)
    private boolean ativoBox = true;

    public Automovel() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
    public Usuario getProprietario() { return proprietario; }
    public void setProprietario(Usuario proprietario) { this.proprietario = proprietario; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public BigDecimal getPrecoPorDia() { return precoPorDia; }
    public void setPrecoPorDia(BigDecimal precoPorDia) { this.precoPorDia = precoPorDia; }

    public Circuito getCircuito() { return circuito; }
    public void setCircuito(Circuito circuito) { this.circuito = circuito; }
    public Set<Circuito> getCircuitosDisponiveis() { return circuitosDisponiveis; }
    public void setCircuitosDisponiveis(Set<Circuito> circuitosDisponiveis) { this.circuitosDisponiveis = circuitosDisponiveis; }
    public void adicionarCircuito(Circuito c) {
        if (c != null) {
            if (this.circuito == null) {
                this.circuito = c;
            }
            this.circuitosDisponiveis.add(c);
        }
    }
    public Integer getPotenciaCv() { return potenciaCv; }
    public void setPotenciaCv(Integer potenciaCv) { this.potenciaCv = potenciaCv; }
    public String getAceleracao0a100() { return aceleracao0a100; }
    public void setAceleracao0a100(String aceleracao0a100) { this.aceleracao0a100 = aceleracao0a100; }
    public String getVelocidadeMaxima() { return velocidadeMaxima; }
    public void setVelocidadeMaxima(String velocidadeMaxima) { this.velocidadeMaxima = velocidadeMaxima; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public boolean isAtivoBox() { return ativoBox; }
    public void setAtivoBox(boolean ativoBox) { this.ativoBox = ativoBox; }
}
