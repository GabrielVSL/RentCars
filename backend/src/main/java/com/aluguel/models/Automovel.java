package com.aluguel.models;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Serdeable
@Entity
@Table(name = "automoveis")
public class Automovel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    // SUGESTÃO DE VALIDATION: adicionar @NotNull e @Size/@Pattern conforme formato da matrícula
    private String matricula; 

    @Column(nullable = false)
    private Integer ano;      
    // SUGESTÃO: validar intervalo razoável (ex: ano entre 1900 e currentYear+1)

    @Column(nullable = false)
    private String marca;     

    @Column(nullable = false)
    private String modelo;    

    @Column(nullable = false, unique = true)
    // SUGESTÃO DE VALIDATION: adicionar @Pattern(regexp = ".{7}") ou regex para placa BR
    private String placa;     

    @Column
    private String imageUrl; // URL vinda do Cloudinary
    // SUGESTÃO: considerar validação de formato (ex: começa com http) e limitar tamanho

    @Column(nullable = false)
    private BigDecimal precoPorDia;
    
        // ARCHITECTURE/EFFICIENCY:
        // - Considere adicionar @Version (optimistic locking) se atualizações concorrentes forem esperadas.
        // - Adicionar índices no banco (via migration) em campos usados em filtros (placa, matricula, proprietario_id).
        // - Para leituras de listas, preferir projeções DTO para reduzir payload.
        // Exemplo:
        // @Version
        // private Long version;
    // SUGESTÃO: adicionar @NotNull e @Digits(integer=10, fraction=2)

    @ManyToOne
    @JoinColumn(name = "proprietario_id", nullable = false)
    private Usuario proprietario;
    

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
}