package com.aluguel.repositories;

import com.aluguel.models.Cliente;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

@Repository
public interface ClienteRepository extends CrudRepository<Cliente, Long> {
    // O Micronaut Data já cria o save(), findAll(), 
    // findById() e deleteById() automaticamente por baixo dos panos 
    // para conversar com o Neon.tech.
}