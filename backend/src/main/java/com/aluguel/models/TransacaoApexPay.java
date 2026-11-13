package com.aluguel.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Serdeable
@Entity
@Table(name = "transacoes_apexpay")
public class TransacaoApexPay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"senha", "saldoCarteira", "totalDepositadoHistorico"})
    private Usuario usuario;

    @Column(nullable = false, length = 30)
    private String tipo; // DEPOSITO, DEBITO_RESERVA, ESTORNO, JUROS_ATRASO

    @Column(nullable = false)
    private BigDecimal valor;

    @Column(nullable = false)
    private LocalDateTime dataHora = LocalDateTime.now();

    @Column(nullable = false)
    private String descricao;

    @Column
    private String trackingReserva;

    public TransacaoApexPay() {}

    public TransacaoApexPay(Usuario usuario, String tipo, BigDecimal valor, String descricao, String trackingReserva) {
        this.usuario = usuario;
        this.tipo = tipo;
        this.valor = valor;
        this.descricao = descricao;
        this.trackingReserva = trackingReserva;
        this.dataHora = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getTrackingReserva() { return trackingReserva; }
    public void setTrackingReserva(String trackingReserva) { this.trackingReserva = trackingReserva; }
}
