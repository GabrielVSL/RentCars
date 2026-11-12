package com.aluguel.controllers;

import com.aluguel.models.TrackSlot;
import com.aluguel.repositories.TrackSlotRepository;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.PathVariable;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Controller("/api/slots")
@Secured(SecurityRule.IS_ANONYMOUS)
public class TrackSlotController {

    private final TrackSlotRepository trackSlotRepository;

    public TrackSlotController(TrackSlotRepository trackSlotRepository) {
        this.trackSlotRepository = trackSlotRepository;
    }

    /**
     * Lista os turnos agendáveis (MANHA, TARDE, NOTURNO) a partir de hoje para o circuito informado.
     */
    @Get("/{circuitoId}")
    public HttpResponse<List<TrackSlot>> listarPorCircuito(@PathVariable String circuitoId) {
        List<TrackSlot> slots = trackSlotRepository
                .findByCircuitoIdAndDataGreaterThanEqualsOrderByDataAsc(circuitoId, LocalDate.now())
                .stream()
                .filter(s -> s.getData() != null && s.getData().getDayOfWeek() != DayOfWeek.MONDAY)
                .toList();
        return HttpResponse.ok(slots);
    }
}
