package com.aluguel.security;

import com.aluguel.models.Usuario;
import com.aluguel.repositories.UsuarioRepository;
import io.micronaut.security.authentication.AuthenticationProvider;
import io.micronaut.security.authentication.AuthenticationRequest;
import io.micronaut.security.authentication.AuthenticationResponse;
import jakarta.inject.Singleton;
import org.mindrot.jbcrypt.BCrypt;
import org.reactivestreams.Publisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Flux;

import java.util.List;

@Singleton
public class AuthProvider<T> implements AuthenticationProvider<T> {

    private static final Logger log = LoggerFactory.getLogger(AuthProvider.class);
    private final UsuarioRepository repository;

    public AuthProvider(UsuarioRepository repository) {
        this.repository = repository;
    }

    @Override
    public Publisher<AuthenticationResponse> authenticate(T httpRequest,
                                                          AuthenticationRequest<?, ?> authRequest) {
        
        String email = authRequest.getIdentity().toString();
        String senhaDigitada = authRequest.getSecret().toString();

        log.debug("Processando tentativa de login para o usuário: {}", email);

        return Flux.create(emitter -> {
            var usuarioOpt = repository.findByEmail(email);

            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                
                if (BCrypt.checkpw(senhaDigitada, usuario.getSenha())) {
                    log.debug("Autenticação com sucesso para: {}", email);
                    emitter.next(AuthenticationResponse.success(email, List.of(usuario.getRole())));
                    emitter.complete();
                    return;
                } else {
                    log.warn("Falha de autenticação (senha inválida) para o usuário: {}", email);
                }
            } else {
                log.warn("Falha de autenticação (usuário inexistente): {}", email);
            }
            
            emitter.error(AuthenticationResponse.exception("Email ou senha inválidos"));
        });
    }
}
