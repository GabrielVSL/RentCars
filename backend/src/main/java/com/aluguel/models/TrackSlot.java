package com.aluguel.models;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
@Entity
@Table(name = "track_slots", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"circuito_id", "data", "turno"})
})
public class TrackSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "circuito_id", nullable = false)
    private Circuito circuito;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false, length = 20)
    private String turno; // MANHA, TARDE, NOTURNO

    @Column(nullable = false)
    private Integer vagasTotais = 12;

    @Column(nullable = false)
    private Integer vagasOcupadas = 0;

    @Column(nullable = false)
    private BigDecimal taxaAdicionalTurno = BigDecimal.ZERO;

    public TrackSlot() {}

    public TrackSlot(Circuito circuito, LocalDate data, String turno, Integer vagasTotais) {
        this.circuito = circuito;
        this.data = data;
        this.turno = turno;
        this.vagasTotais = vagasTotais;
        this.vagasOcupadas = 0;
        this.taxaAdicionalTurno = BigDecimal.ZERO;
    }

    public boolean temVagaDisponivel() {
        return vagasOcupadas < vagasTotais;
    }

    public void ocuparVaga() {
        if (!temVagaDisponivel()) {
            throw new IllegalStateException("Slot de pista esgotado para o autódromo " + (circuito != null ? circuito.getNome() : "") + " no turno " + turno);
        }
        this.vagasOcupadas++;
    }

    public void liberarVaga() {
        if (this.vagasOcupadas > 0) {
            this.vagasOcupadas--;
        }
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Circuito getCircuito() { return circuito; }
    public void setCircuito(Circuito circuito) { this.circuito = circuito; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }

    public String getTurno() { return turno; }
    public void setTurno(String turno) { this.turno = turno; }

    public Integer getVagasTotais() { return vagasTotais; }
    public void setVagasTotais(Integer vagasTotais) { this.vagasTotais = vagasTotais; }

    public Integer getVagasOcupadas() { return vagasOcupadas; }
    public void setVagasOcupadas(Integer vagasOcupadas) { this.vagasOcupadas = vagasOcupadas; }

    public BigDecimal getTaxaAdicionalTurno() { return taxaAdicionalTurno; }
    public void setTaxaAdicionalTurno(BigDecimal taxaAdicionalTurno) { this.taxaAdicionalTurno = taxaAdicionalTurno; }
}
