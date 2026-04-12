package com.aluguel.repositories;

import com.aluguel.models.Usuario;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends CrudRepository<Usuario, Long> {
    
    // O Micronaut Data cria a consulta SQL automaticamente só pelo nome do método!
    Optional<Usuario> findByEmail(String email);
}