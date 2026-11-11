package com.aluguel.models;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

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

    @Column(nullable = false)
    private LocalDateTime dataPedido = LocalDateTime.now();

    // Valor financeiro da reserva
    @Column(nullable = false)
    private BigDecimal valorTotal;

    @Column(nullable = false)
    private String status = "PENDENTE_EMPRESA";

    // --- 🏎️ CAMPOS DO APEX TRACK EXPERIENCE & APEXPAY ---
    @ManyToOne
    @JoinColumn(name = "track_slot_id")
    private TrackSlot trackSlot;

    @Column(length = 30)
    private String tipoServico = "TRACK_EXPERIENCE"; // VISITA_BOX, FAST_LAP, TRACK_EXPERIENCE, PACOTE_VIP

    @Column(unique = true, length = 30)
    private String trackingCode; // Ex: #APX-782910

    @Column
    private BigDecimal descontoFidelidade = BigDecimal.ZERO;

    @Column
    private BigDecimal valorFinal;

    // 🔒 Optimistic Locking para prevenção de concorrência e double-booking
    @Version
    private Integer version;

    public Pedido() {
        this.trackingCode = "APX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public Automovel getAutomovel() { return automovel; }
    public void setAutomovel(Automovel automovel) { this.automovel = automovel; }
    public Agente getAgenteAvaliador() { return agenteAvaliador; }
    public void setAgenteAvaliador(Agente agenteAvaliador) { this.agenteAvaliador = agenteAvaliador; }
    public LocalDateTime getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDateTime dataInicio) { this.dataInicio = dataInicio; }
    public LocalDateTime getDataFim() { return dataFim; }
    public void setDataFim(LocalDateTime dataFim) { this.dataFim = dataFim; }
    public LocalDateTime getDataPedido() { return dataPedido; }
    public void setDataPedido(LocalDateTime dataPedido) { this.dataPedido = dataPedido; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }

    public TrackSlot getTrackSlot() { return trackSlot; }
    public void setTrackSlot(TrackSlot trackSlot) { this.trackSlot = trackSlot; }
    public String getTipoServico() { return tipoServico; }
    public void setTipoServico(String tipoServico) { this.tipoServico = tipoServico; }
    public String getTrackingCode() { return trackingCode; }
    public void setTrackingCode(String trackingCode) { this.trackingCode = trackingCode; }
    public BigDecimal getDescontoFidelidade() { return descontoFidelidade; }
    public void setDescontoFidelidade(BigDecimal descontoFidelidade) { this.descontoFidelidade = descontoFidelidade; }
    public BigDecimal getValorFinal() { return valorFinal != null ? valorFinal : valorTotal; }
    public void setValorFinal(BigDecimal valorFinal) { this.valorFinal = valorFinal; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}
