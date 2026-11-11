package com.aluguel.queue;

import io.micronaut.serde.annotation.Serdeable;
import java.time.LocalDateTime;

@Serdeable
public class ReservaMensagem {

    private String trackingId;
    private String emailCliente;
    private Long automovelId;
    private String tipoServico;
    private Long slotId;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    private int tentativas = 0;
    private LocalDateTime dataHoraEnfileiramento;
    private String motivoFalha;
    private String status = "PENDENTE"; // PENDENTE, PROCESSANDO, CONCLUIDO, DLQ

    public ReservaMensagem() {
        this.dataHoraEnfileiramento = LocalDateTime.now();
    }

    public ReservaMensagem(String trackingId, String emailCliente, Long automovelId, String tipoServico, Long slotId, LocalDateTime dataInicio, LocalDateTime dataFim) {
        this.trackingId = trackingId;
        this.emailCliente = emailCliente;
        this.automovelId = automovelId;
        this.tipoServico = tipoServico;
        this.slotId = slotId;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.dataHoraEnfileiramento = LocalDateTime.now();
        this.status = "PENDENTE";
    }

    public String getTrackingId() {
        return trackingId;
    }

    public void setTrackingId(String trackingId) {
        this.trackingId = trackingId;
    }

    public String getEmailCliente() {
        return emailCliente;
    }

    public void setEmailCliente(String emailCliente) {
        this.emailCliente = emailCliente;
    }

    public Long getAutomovelId() {
        return automovelId;
    }

    public void setAutomovelId(Long automovelId) {
        this.automovelId = automovelId;
    }

    public String getTipoServico() {
        return tipoServico;
    }

    public void setTipoServico(String tipoServico) {
        this.tipoServico = tipoServico;
    }

    public Long getSlotId() {
        return slotId;
    }

    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }

    public LocalDateTime getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDateTime dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDateTime getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDateTime dataFim) {
        this.dataFim = dataFim;
    }

    public int getTentativas() {
        return tentativas;
    }

    public void setTentativas(int tentativas) {
        this.tentativas = tentativas;
    }

    public void incrementarTentativa() {
        this.tentativas++;
    }

    public LocalDateTime getDataHoraEnfileiramento() {
        return dataHoraEnfileiramento;
    }

    public void setDataHoraEnfileiramento(LocalDateTime dataHoraEnfileiramento) {
        this.dataHoraEnfileiramento = dataHoraEnfileiramento;
    }

    public String getMotivoFalha() {
        return motivoFalha;
    }

    public void setMotivoFalha(String motivoFalha) {
        this.motivoFalha = motivoFalha;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
