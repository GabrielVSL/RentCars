package com.aluguel.repositories;

import com.aluguel.models.Agente;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;
import java.util.Optional;

@Repository
public interface AgenteRepository extends CrudRepository<Agente, Long> {
    Optional<Agente> findByCnpj(String cnpj);
}
