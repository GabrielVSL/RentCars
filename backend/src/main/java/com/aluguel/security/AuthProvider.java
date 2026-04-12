package com.aluguel.security;

import com.aluguel.models.Usuario;
import com.aluguel.repositories.UsuarioRepository;
import io.micronaut.security.authentication.AuthenticationProvider;
import io.micronaut.security.authentication.AuthenticationRequest;
import io.micronaut.security.authentication.AuthenticationResponse;
import jakarta.inject.Singleton;
import org.mindrot.jbcrypt.BCrypt;
import org.reactivestreams.Publisher;
import reactor.core.publisher.Flux;

import java.util.List;

@Singleton
public class AuthProvider<T> implements AuthenticationProvider<T> {

    private final UsuarioRepository repository;

    public AuthProvider(UsuarioRepository repository) {
        this.repository = repository;
    }

    @Override
    public Publisher<AuthenticationResponse> authenticate(T httpRequest,
                                                          AuthenticationRequest<?, ?> authRequest) {
        
        String email = authRequest.getIdentity().toString();
        String senhaDigitada = authRequest.getSecret().toString();

        System.out.println("🚨 TENTATIVA DE LOGIN - Email recebido: " + email);

        return Flux.create(emitter -> {
            var usuarioOpt = repository.findByEmail(email);

            if (usuarioOpt.isPresent()) {
                System.out.println("🚨 USUÁRIO ENCONTRADO NO BANCO!");
                Usuario usuario = usuarioOpt.get();
                
                if (BCrypt.checkpw(senhaDigitada, usuario.getSenha())) {
                    System.out.println("🚨 SENHA BATEU! GERANDO TOKEN...");
                    emitter.next(AuthenticationResponse.success(email, List.of(usuario.getRole())));
                    emitter.complete();
                    return;
                } else {
                    System.out.println("🚨 SENHA INCORRETA!");
                }
            } else {
                System.out.println("🚨 USUÁRIO NÃO EXISTE NO BANCO!");
            }
            
            emitter.error(AuthenticationResponse.exception("Email ou senha inválidos"));
        });
    }
}