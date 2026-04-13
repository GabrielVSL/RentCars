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
    public HttpResponse<Usuario> registrar(@Body Map<String, Object> payload) {
        try {
            Usuario salvo = facade.registrar(payload);
            return HttpResponse.created(salvo);
        } catch (Exception e) {
            return HttpResponse.badRequest();
        }
    }
}