package com.aluguel.controllers;

import com.aluguel.facades.AutomovelFacade;
import com.aluguel.models.Automovel;
import com.aluguel.repositories.AutomovelRepository;

import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;

@Controller("/api/automoveis")
public class AutomovelController {

    private final AutomovelFacade facade;
    private final AutomovelRepository automovelRepository;

    public AutomovelController(AutomovelFacade facade, AutomovelRepository automovelRepository) {
        this.facade = facade;
        this.automovelRepository = automovelRepository;
    }

    // APENAS Empresas podem cadastrar carros novos
    @Post
    @Secured("ROLE_EMPRESA")
    public HttpResponse<?> criar(@Body Automovel automovel, Principal principal) {
        try {
            Automovel salvo = facade.criar(automovel, principal.getName());
            return HttpResponse.created(salvo);
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest(Map.of("message", e.getMessage()));
        }
    }

    // Listar apenas a frota da empresa logada
    @Get("/minha-frota")
    @Secured("ROLE_EMPRESA")
    public HttpResponse<?> listarMinhaFrota(Principal principal) {
        try {
            return HttpResponse.ok(facade.listarPorProprietario(principal.getName()));
        } catch (Exception e) {
            return HttpResponse.badRequest(Map.of("message", e.getMessage()));
        }
    }

    @Put("/{id}")
    @Secured("ROLE_EMPRESA")
    public HttpResponse<?> atualizar(@PathVariable Long id, @Body Automovel automovel, Principal principal) {
        try {
            return HttpResponse.ok(facade.atualizar(id, automovel, principal.getName()));
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest(Map.of("message", e.getMessage()));
        }
    }

    @Delete("/{id}")
    @Secured("ROLE_EMPRESA")
    public HttpResponse<?> excluir(@PathVariable Long id, Principal principal) {
        try {
            facade.deletar(id, principal.getName());
            return HttpResponse.noContent();
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest(Map.of("message", e.getMessage()));
        }
    }

    @Get("/{id}")
    @Secured(SecurityRule.IS_ANONYMOUS)
    public HttpResponse<?> buscarPorId(@PathVariable Long id) {
        try {
            return HttpResponse.ok(facade.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return HttpResponse.notFound(Map.of("message", e.getMessage()));
        }
    }

    @Get
    @Secured(SecurityRule.IS_ANONYMOUS)
    public HttpResponse<?> listarAutomoveis(
            @Nullable @QueryValue String inicio,
            @Nullable @QueryValue String fim) {

        try {
            if (inicio != null && fim != null) {
                LocalDateTime dataInicio = LocalDateTime.parse(inicio);
                LocalDateTime dataFim = LocalDateTime.parse(fim);

                return HttpResponse.ok(automovelRepository.findDisponiveis(dataInicio, dataFim));
            }

            return HttpResponse.ok(facade.listarTodos());
        } catch (Exception e) {
            return HttpResponse.badRequest(Map.of("message", e.getMessage()));
        }
    }
}
