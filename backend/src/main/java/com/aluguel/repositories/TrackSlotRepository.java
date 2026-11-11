package com.aluguel.repositories;

import com.aluguel.models.TrackSlot;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrackSlotRepository extends CrudRepository<TrackSlot, Long> {
    List<TrackSlot> findByCircuitoIdAndDataGreaterThanEqualsOrderByDataAsc(String circuitoId, LocalDate data);
    Optional<TrackSlot> findByCircuitoIdAndDataAndTurno(String circuitoId, LocalDate data, String turno);
}
