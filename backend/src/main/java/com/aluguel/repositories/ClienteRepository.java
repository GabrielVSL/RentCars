package com.aluguel.repositories;

import com.aluguel.models.Cliente;
import jakarta.inject.Singleton;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Singleton
public class ClienteRepository {
    private final List<Cliente> clientes = new ArrayList<>();
    private final AtomicLong currentId = new AtomicLong(1);

    public List<Cliente> findAll() {
        return clientes;
    }

    public Optional<Cliente> findById(Long id) {
        return clientes.stream().filter(c -> c.getId().equals(id)).findFirst();
    }

    public Cliente save(Cliente cliente) {
        if (cliente.getId() == null) {
            cliente.setId(currentId.getAndIncrement());
            clientes.add(cliente);
        } else {
            deleteById(cliente.getId());
            clientes.add(cliente);
        }
        return cliente;
    }

    public boolean deleteById(Long id) {
        return clientes.removeIf(c -> c.getId().equals(id));
    }
}