package com.aluguel.repositories;

import com.aluguel.models.Pedido;

import io.micronaut.data.annotation.Query;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PedidoRepository extends CrudRepository<Pedido, Long> {
    List<Pedido> findByAutomovelProprietarioEmail(String email);
    List<Pedido> findByClienteEmail(String email);
    List<Pedido> findByAutomovelIdAndStatusIn(Long automovelId, List<String> statuses);

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.automovel.id = :automovelId " +
           "AND p.status IN ('PENDENTE_EMPRESA', 'PENDENTE_BANCO', 'APROVADO') " +
           "AND p.dataInicio < :novaDataFim " +
           "AND p.dataFim > :novaDataInicio")
    long countAlugueisConflitantes(Long automovelId, LocalDateTime novaDataInicio, LocalDateTime novaDataFim);
}