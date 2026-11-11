package com.aluguel.repositories;

import com.aluguel.models.Circuito;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;
import java.util.List;

@Repository
public interface CircuitoRepository extends CrudRepository<Circuito, String> {
    List<Circuito> findByAtivoTrue();
}
