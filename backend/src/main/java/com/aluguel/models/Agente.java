package com.aluguel.models;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.*;

@Serdeable
@Entity
@Table(name = "agentes")
public class Agente extends Usuario {
    
    @Column(unique = true)
    private String cnpj;

    public Agente() {}

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
}