package com.aluguel.repositories;

import com.aluguel.models.Pedido;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

@Repository
public interface PedidoRepository extends CrudRepository<Pedido, Long> {
}