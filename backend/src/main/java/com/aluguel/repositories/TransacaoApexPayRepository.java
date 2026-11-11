package com.aluguel.repositories;

import com.aluguel.models.TransacaoApexPay;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;
import java.util.List;

@Repository
public interface TransacaoApexPayRepository extends CrudRepository<TransacaoApexPay, Long> {
    List<TransacaoApexPay> findByUsuarioIdOrderByDataHoraDesc(Long usuarioId);
}
