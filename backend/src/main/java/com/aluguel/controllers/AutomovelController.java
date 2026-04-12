package com.aluguel.controllers;

import com.aluguel.models.Automovel;
import com.aluguel.facades.AutomovelFacade;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import java.util.List;

@Controller("/api/automoveis")
@Secured(SecurityRule.IS_AUTHENTICATED) // Só quem logou (tem o token) entra aqui
public class AutomovelController {

    private final AutomovelFacade facade;

    public AutomovelController(AutomovelFacade facade) {
        this.facade = facade;
    }

    @Get
    public List<Automovel> listar() {
        return facade.listarTodos();
    }

    @Post
    public Automovel salvar(@Body Automovel automovel) {
        return facade.criar(automovel);
    }
}