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

@Get
    @Secured(io.micronaut.security.rules.SecurityRule.IS_ANONYMOUS)
    public HttpResponse<?> listarAutomoveis(
            @Nullable @QueryValue String inicio, 
            @Nullable @QueryValue String fim) {
        
        try {
            // Se o React enviou as datas, filtra os disponíveis
            if (inicio != null && fim != null) {
                LocalDateTime dataInicio = LocalDateTime.parse(inicio);
                LocalDateTime dataFim = LocalDateTime.parse(fim);
                
                return HttpResponse.ok(automovelRepository.findDisponiveis(dataInicio, dataFim));
            }
            
            // Se não enviou datas (acabou de entrar na tela), usa o facade para listar todos!
            return HttpResponse.ok(facade.listarTodos());
            
        } catch (Exception e) {
            return HttpResponse.badRequest(e.getMessage());
        }
    }
}