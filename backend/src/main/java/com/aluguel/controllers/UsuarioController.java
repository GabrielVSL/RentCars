package com.aluguel.controllers;

import com.aluguel.facades.UsuarioFacade;
import com.aluguel.models.Usuario;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import java.util.Map;

@Controller("/api/usuarios")
@Secured(SecurityRule.IS_ANONYMOUS)
public class UsuarioController {

    private final UsuarioFacade facade;

    public UsuarioController(UsuarioFacade facade) {
        this.facade = facade;
    }

    @Post("/registrar")
    public HttpResponse<?> registrar(@Body Map<String, Object> payload) {
        try {
            Usuario salvo = facade.registrar(payload);
            return HttpResponse.created(salvo);
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return HttpResponse.badRequest(Map.of("message", "Erro ao registrar usuário. Verifique se o e-mail ou documento já existem."));
        }
    }
}
