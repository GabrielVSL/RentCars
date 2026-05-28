package com.aluguel.repositories;

import java.time.LocalDateTime;
import java.util.List;

import com.aluguel.models.Automovel;

import io.micronaut.data.annotation.Query;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

@Repository
public interface AutomovelRepository extends CrudRepository<Automovel, Long> {
    @Query("SELECT a FROM Automovel a WHERE a.id NOT IN (" +
           "SELECT p.automovel.id FROM Pedido p WHERE " +
           "p.status IN ('PENDENTE_EMPRESA', 'PENDENTE_BANCO', 'APROVADO') " +
           "AND p.dataInicio <= :dataFim " +
           "AND p.dataFim >= :dataInicio)")
        // NOTE (eficiência): Query original pode causar N+1 se o fetch das relações
        // não for controlado; também falta paginação. Recomenda-se:
        // - Usar projeção para retornar apenas campos necessários (AutomovelProjection)
        // - Adicionar paginação (pageable) nos endpoints que chamam este método
        @Query("""
        SELECT a FROM Automovel a WHERE a.id NOT IN (
            SELECT p.automovel.id FROM Pedido p WHERE 
            p.status IN ('PENDENTE_EMPRESA', 'PENDENTE_BANCO', 'APROVADO') 
            AND p.dataInicio <= :dataFim 
            AND p.dataFim >= :dataInicio)
        """)
        List<Automovel> findDisponiveis(LocalDateTime dataInicio, LocalDateTime dataFim);
}