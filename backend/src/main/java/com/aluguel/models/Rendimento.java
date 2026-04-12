package com.aluguel.models;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.Embeddable;

@Serdeable
@Embeddable // Diz que esses dados vão ser embutidos na tabela auxiliar de rendimentos
public class Rendimento {

    private String empregadora;
    private Double valor;

    public Rendimento() {}

    public String getEmpregadora() { return empregadora; }
    public void setEmpregadora(String empregadora) { this.empregadora = empregadora; }

    public Double getValor() { return valor; }
    public void setValor(Double valor) { this.valor = valor; }
}