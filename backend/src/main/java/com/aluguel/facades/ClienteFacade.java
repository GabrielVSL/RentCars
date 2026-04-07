package com.aluguel.facades;

import com.aluguel.models.Cliente;
import com.aluguel.repositories.ClienteRepository;
import jakarta.inject.Singleton;
import java.util.List;
import java.util.Optional;

@Singleton // O Micronaut vai gerenciar essa classe
public class ClienteFacade {

    private final ClienteRepository repository;

    // Injeção de dependência do repositório
    public ClienteFacade(ClienteRepository repository) {
        this.repository = repository;
    }

    public List<Cliente> listarTodos() {
        return repository.findAll();
    }

    public Optional<Cliente> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Cliente criar(Cliente cliente) {
        validarRegrasDeNegocio(cliente);
        return repository.save(cliente);
    }

    public Optional<Cliente> atualizar(Long id, Cliente cliente) {
        if (repository.findById(id).isEmpty()) {
            return Optional.empty();
        }
        validarRegrasDeNegocio(cliente);
        cliente.setId(id);
        return Optional.of(repository.save(cliente));
    }

    public boolean excluir(Long id) {
        return repository.deleteById(id);
    }

    // Centralizamos a regra de negócio em um método privado!
private void validarRegrasDeNegocio(Cliente cliente) {
        if (cliente.getNome() == null || cliente.getNome().trim().isEmpty()) {
            throw new IllegalArgumentException("O nome do cliente é obrigatório.");
        }
        if (cliente.getCpf() == null || cliente.getCpf().trim().isEmpty()) {
            throw new IllegalArgumentException("O CPF é obrigatório.");
        }
        if (cliente.getRg() == null || cliente.getRg().trim().isEmpty()) {
            throw new IllegalArgumentException("O RG é obrigatório.");
        }
        if (cliente.getRendimentos() != null && cliente.getRendimentos().size() > 3) {
            throw new IllegalArgumentException("O cliente pode ter no máximo 3 rendimentos.");
        }
        
        // Remove rendimentos vazios que o usuário possa ter adicionado e deixado em branco no frontend
        if (cliente.getRendimentos() != null) {
            cliente.getRendimentos().removeIf(r -> 
                (r.getEmpregadora() == null || r.getEmpregadora().trim().isEmpty()) && 
                (r.getValor() == null || r.getValor() == 0.0)
            );
        }
    }
}