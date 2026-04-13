package com.aluguel.models;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.*;
import java.util.List;

@Serdeable
@Entity
@Table(name = "clientes")
public class Cliente extends Usuario {

    private String cpf;
    private String rg;
    private String profissao;

    // Conforme o PDF: lista de até 3 rendimentos
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "cliente_rendimentos", joinColumns = @JoinColumn(name = "cliente_id"))
    private List<Rendimento> rendimentos;

    public Cliente() {}

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getRg() { return rg; }
    public void setRg(String rg) { this.rg = rg; }
    public String getProfissao() { return profissao; }
    public void setProfissao(String profissao) { this.profissao = profissao; }
    public List<Rendimento> getRendimentos() { return rendimentos; }
    public void setRendimentos(List<Rendimento> rendimentos) { this.rendimentos = rendimentos; }
}