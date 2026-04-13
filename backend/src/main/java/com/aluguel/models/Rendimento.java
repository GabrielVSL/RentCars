package com.aluguel.models;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.Embeddable;
import java.math.BigDecimal;

@Serdeable
@Embeddable
public class Rendimento {
    // Usando o termo exato do PDF para evitar erro na Facade
    private String empregadora; 
    private BigDecimal valor;

    public Rendimento() {}

    public String getEmpregadora() { return empregadora; }
    public void setEmpregadora(String empregadora) { this.empregadora = empregadora; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
}