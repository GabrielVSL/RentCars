package com.aluguel.models;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Serdeable
@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quem pediu (Cliente)
    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    // O que foi pedido (Automovel)
    @ManyToOne
    @JoinColumn(name = "automovel_id", nullable = false)
    private Automovel automovel;

    // Quem avaliou (Empresa/Banco) - Pode ser nulo até ser avaliado
    @ManyToOne
    @JoinColumn(name = "agente_id")
    private Agente agenteAvaliador;

// As datas que o cliente escolhe no calendário do site
    @Column(nullable = false)
    private LocalDateTime dataInicio;

    @Column(nullable = false)
    private LocalDateTime dataFim;

    // A data que o sistema gera sozinha (não precisa nem vir do React)
    @Column(nullable = false)
    private LocalDateTime dataPedido = LocalDateTime.now();

    // PENDENTE, APROVADO, REJEITADO, CANCELADO
    @Column(nullable = false)
    private String status = "PENDENTE"; 

    // Getters e Setters de Datas Corrigidos
    public LocalDateTime getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDateTime dataInicio) { this.dataInicio = dataInicio; }
    
    public LocalDateTime getDataFim() { return dataFim; }
    public void setDataFim(LocalDateTime dataFim) { this.dataFim = dataFim; }
    
    public LocalDateTime getDataPedido() { return dataPedido; }
    public void setDataPedido(LocalDateTime dataPedido) { this.dataPedido = dataPedido; }

    public Pedido() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public Automovel getAutomovel() { return automovel; }
    public void setAutomovel(Automovel automovel) { this.automovel = automovel; }
    public Agente getAgenteAvaliador() { return agenteAvaliador; }
    public void setAgenteAvaliador(Agente agenteAvaliador) { this.agenteAvaliador = agenteAvaliador; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}