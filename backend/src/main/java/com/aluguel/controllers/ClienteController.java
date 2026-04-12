package com.aluguel.controllers;

import com.aluguel.facades.ClienteFacade;
import com.aluguel.models.Cliente;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;

import java.util.List;

@Controller("/api/clientes")
@Secured(SecurityRule.IS_ANONYMOUS)
public class ClienteController {

    private final ClienteFacade facade;

    // Agora injetamos a Fachada, e não mais o Repositório
    public ClienteController(ClienteFacade facade) {
        this.facade = facade;
    }

    @Get
    public List<Cliente> listar() {
        return facade.listarTodos();
    }

    @Get("/{id}")
    public HttpResponse<Cliente> buscar(Long id) {
        return facade.buscarPorId(id)
                .map(HttpResponse::ok)
                .orElse(HttpResponse.notFound());
    }

    @Post
    public HttpResponse<?> criar(@Body Cliente cliente) {
        try {
            Cliente salvo = facade.criar(cliente);
            return HttpResponse.created(salvo);
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest(e.getMessage());
        }
    }

    @Put("/{id}")
    public HttpResponse<?> atualizar(Long id, @Body Cliente cliente) {
        try {
            return facade.atualizar(id, cliente)
                    .map(HttpResponse::ok)
                    .orElse(HttpResponse.notFound());
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest(e.getMessage());
        }
    }

    @Delete("/{id}")
    public HttpResponse<?> excluir(Long id) {
        if (facade.excluir(id)) {
            return HttpResponse.noContent();
        }
        return HttpResponse.notFound();
    }
}