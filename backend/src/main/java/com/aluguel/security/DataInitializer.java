package com.aluguel.security;

import com.aluguel.models.Usuario;
import com.aluguel.repositories.UsuarioRepository;
import io.micronaut.context.event.StartupEvent;
import io.micronaut.runtime.event.annotation.EventListener;
import jakarta.inject.Singleton;
import org.mindrot.jbcrypt.BCrypt;

@Singleton
public class DataInitializer {

    private final UsuarioRepository repository;

    public DataInitializer(UsuarioRepository repository) {
        this.repository = repository;
    }

    @EventListener
    public void onStartup(StartupEvent event) {
        // Conta quantos usuários existem. Se for zero, cria o admin.
        if (repository.count() == 0) {
            Usuario admin = new Usuario();
            admin.setEmail("admin@rentcars.com");
            // Criptografa a senha "123456" usando BCrypt antes de salvar
            admin.setSenha(BCrypt.hashpw("123456", BCrypt.gensalt()));
            admin.setRole("ROLE_AGENTE"); // Nível de acesso exigido no PDF
            
            repository.save(admin);
            System.out.println("✅ Usuário Admin criado com sucesso!");
        }
    }
}