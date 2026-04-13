package com.aluguel.controllers;

import com.aluguel.facades.PedidoFacade;
import com.aluguel.models.Pedido;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import java.security.Principal;

@Controller("/api/pedidos")
public class PedidoController {

    private final PedidoFacade facade;

    public PedidoController(PedidoFacade facade) {
        this.facade = facade;
    }

    // Apenas CLIENTES podem fazer pedidos de aluguel
    @Post
    @Secured("ROLE_CLIENTE")
    public HttpResponse<?> criar(@Body Pedido pedido, Principal principal) {
        try {
            Pedido salvo = facade.criarPedido(pedido, principal.getName());
            return HttpResponse.created(salvo);
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest(e.getMessage());
        }
    }

    // Empresas ou Bancos avaliam os pedidos
    @Put("/{id}/avaliar")
    @Secured({"ROLE_EMPRESA", "ROLE_BANCO"})
    public HttpResponse<?> avaliar(@PathVariable Long id, @QueryValue String status, Principal principal) {
        try {
            Pedido avaliado = facade.avaliarPedido(id, principal.getName(), status);
            return HttpResponse.ok(avaliado);
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest(e.getMessage());
        }
    }
}