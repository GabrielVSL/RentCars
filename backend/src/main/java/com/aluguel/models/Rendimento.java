package com.aluguel.models;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public class Rendimento {
    private String empregadora;
    private Double valor;

    // Construtores, Getters e Setters
    public Rendimento() {}

    public String getEmpregadora() { return empregadora; }
    public void setEmpregadora(String empregadora) { this.empregadora = empregadora; }

    public Double getValor() { return valor; }
    public void setValor(Double valor) { this.valor = valor; }
}