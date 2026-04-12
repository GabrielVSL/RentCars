package com.aluguel.facades;

import com.aluguel.models.Automovel;
import com.aluguel.repositories.AutomovelRepository;
import jakarta.inject.Singleton;
import java.util.List;
import java.util.Optional;

@Singleton
public class AutomovelFacade {

    private final AutomovelRepository repository;

    public AutomovelFacade(AutomovelRepository repository) {
        this.repository = repository;
    }

    public List<Automovel> listarTodos() {
        return repository.findAll();
    }

    public Automovel criar(Automovel automovel) {
        // Aqui você pode adicionar validações extras depois
        return repository.save(automovel);
    }

    public boolean excluir(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}