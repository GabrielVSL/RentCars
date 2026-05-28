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

    /*
     * ARCHITECTURE / EFFICIENCY NOTES (Controller layer)
     *
     * Objetivo arquitetural:
     * - Manter o Controller estritamente responsável por: receber o request HTTP,
     *   autenticar/autorização (token/roles), validar formato de entrada (DTOs)
     *   e delegar toda a lógica de negócio a um Service/Facade.
     *
     * Recomendações práticas:
     * 1) Use DTOs para entrada e saída (ex: `AutomovelQueryParams`, `AutomovelResponse`).
     *    - Valide query params com Bean Validation ao desserializar.
     * 2) Não invoque repositórios diretamente do Controller. Devolva apenas DTOs.
     * 3) Tratamento de erros: implemente um handler global (Micronaut `@Error` / ControllerAdvice)
     *    que traduza exceções técnicas em respostas HTTP padronizadas (400/403/404/500).
     * 4) Performance: para endpoints de listagem, sempre oferecer paginação e filtros
     *    (page, size, sort) para evitar carregar grandes volumes em memória.
     * 5) Observability: logue entrada/saída leve (correlationId, tempo) e exponha métricas.
     *
     * Justificativa de eficiência:
     * - Separar camadas permite otimizar queries no repositório (projeções, índices)
     *   sem alterar a camada HTTP.
     * - Paginação + projeções (select fields) reduz uso de memória e I/O.
     *
     * Exemplo de fluxo desejado:
     * Controller (HTTP) -> Facade/Service (transacional, regras) -> Repository (queries otimizadas)
     */

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
                // AQUI: parse direto pode lançar DateTimeParseException
                // SUGESTÃO: usar DateTimeFormatter.ISO_DATE_TIME com try/catch e retornar 400 se inválido.
                // MELHOR: delegar a busca para o facade (ex: facade.listarDisponiveis(inicio,fim))
                LocalDateTime dataInicio = LocalDateTime.parse(inicio);
                LocalDateTime dataFim = LocalDateTime.parse(fim);

                // Nota: controller delega diretamente ao repository -> mistura camadas.
                // Recomendo: criar AutomovelFacade.listarDisponiveis(inicio,fim) que retorna DTOs.
                return HttpResponse.ok(automovelRepository.findDisponiveis(dataInicio, dataFim));
            }
            
            // Se não enviou datas (acabou de entrar na tela), usa o facade para listar todos!
            return HttpResponse.ok(facade.listarTodos());
            
        } catch (Exception e) {
            // Evitar catch genérico; preferir handler global. Por enquanto mapeamos para 400.
            return HttpResponse.badRequest(e.getMessage());
        }
    }
}