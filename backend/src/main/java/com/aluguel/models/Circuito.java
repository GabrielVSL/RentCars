package com.aluguel.models;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Serdeable
@Entity
@Table(name = "circuitos")
public class Circuito {

    @Id
    @Column(length = 50)
    private String id; // Ex: interlagos, nurburgring, spa, monza, monaco, le_mans, silverstone, suzuka

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String pais;

    @Column(nullable = false)
    private String regiao;

    @Column(nullable = false)
    private BigDecimal extensaoKm;

    @Column(nullable = false)
    private Integer curvas;

    @Column
    private String recordeTempo;

    @Column(nullable = false)
    private Integer capacidadeBoxes = 12; // Máximo de carros simultâneos por sessão

    @Column(nullable = false)
    private boolean ativo = true;

    public Circuito() {}

    public Circuito(String id, String nome, String pais, String regiao, BigDecimal extensaoKm, Integer curvas, String recordeTempo, Integer capacidadeBoxes) {
        this.id = id;
        this.nome = nome;
        this.pais = pais;
        this.regiao = regiao;
        this.extensaoKm = extensaoKm;
        this.curvas = curvas;
        this.recordeTempo = recordeTempo;
        this.capacidadeBoxes = capacidadeBoxes;
        this.ativo = true;
    }

    // Getters e Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }

    public String getRegiao() { return regiao; }
    public void setRegiao(String regiao) { this.regiao = regiao; }

    public BigDecimal getExtensaoKm() { return extensaoKm; }
    public void setExtensaoKm(BigDecimal extensaoKm) { this.extensaoKm = extensaoKm; }

    public Integer getCurvas() { return curvas; }
    public void setCurvas(Integer curvas) { this.curvas = curvas; }

    public String getRecordeTempo() { return recordeTempo; }
    public void setRecordeTempo(String recordeTempo) { this.recordeTempo = recordeTempo; }

    public Integer getCapacidadeBoxes() { return capacidadeBoxes; }
    public void setCapacidadeBoxes(Integer capacidadeBoxes) { this.capacidadeBoxes = capacidadeBoxes; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}
