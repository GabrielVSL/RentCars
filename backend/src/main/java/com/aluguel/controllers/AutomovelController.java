package com.aluguel.controllers;

import com.aluguel.facades.AutomovelFacade;
import com.aluguel.models.Automovel;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import java.security.Principal;

@Controller("/api/automoveis")
public class AutomovelController {

    private final AutomovelFacade facade;

    public AutomovelController(AutomovelFacade facade) {
        this.facade = facade;
    }

    // Qualquer um pode ver os carros (Vitrine)
    @Get
    @Secured(SecurityRule.IS_ANONYMOUS)
    public HttpResponse<?> listar() {
        return HttpResponse.ok(facade.listarTodos());
    }

    // APENAS Empresas podem cadastrar carros novos
    @Post
    @Secured("ROLE_EMPRESA")
    public HttpResponse<?> criar(@Body Automovel automovel, Principal principal) {
        try {
            // O "principal.getName()" pega o e-mail de quem está logado no token JWT
            Automovel salvo = facade.criar(automovel, principal.getName());
            return HttpResponse.created(salvo);
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest(e.getMessage());
        }
    }
    
    @Put("/{id}")
    @Secured("ROLE_EMPRESA")
    public HttpResponse<?> atualizar(@PathVariable Long id, @Body Automovel automovel, Principal principal) {
        return HttpResponse.ok(facade.atualizar(id, automovel, principal.getName()));
    }

    @Delete("/{id}")
    @Secured("ROLE_EMPRESA")
    public HttpResponse<?> excluir(@PathVariable Long id, Principal principal) {
        facade.deletar(id, principal.getName());
        return HttpResponse.noContent();
    }
}