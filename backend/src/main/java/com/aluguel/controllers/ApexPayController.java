package com.aluguel.controllers;

import com.aluguel.facades.ApexPayFacade;
import com.aluguel.models.TransacaoApexPay;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.authentication.Authentication;
import io.micronaut.security.rules.SecurityRule;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@Controller("/api/apexpay")
@Secured(SecurityRule.IS_AUTHENTICATED)
public class ApexPayController {

    private final ApexPayFacade facade;

    public ApexPayController(ApexPayFacade facade) {
        this.facade = facade;
    }

    /**
     * Realiza um depósito na carteira ApexPay.
     * Atualiza saldo em tempo real e recalcula o Tier de Fidelidade (Standard, Silver, Gold, Apex Black).
     */
    @Post("/deposito")
    public HttpResponse<?> depositar(@Body Map<String, Object> payload, Authentication authentication) {
        try {
            String email = authentication != null ? authentication.getName() : null;
            boolean isAdminOrBanco = authentication != null && (
                    authentication.getRoles().contains("ROLE_ADMIN") ||
                    authentication.getRoles().contains("ROLE_BANCO")
            );

            if (payload.get("email") != null && isAdminOrBanco) {
                // Admin ou Banco podem creditar na conta de outro usuário
                email = (String) payload.get("email");
            }
            if (email == null) {
                return HttpResponse.badRequest(Map.of("message", "E-mail do usuário não identificado."));
            }

            Object valorObj = payload.get("valor");
            if (valorObj == null) {
                return HttpResponse.badRequest(Map.of("message", "Campo 'valor' é obrigatório."));
            }
            BigDecimal valor = new BigDecimal(valorObj.toString());
            String descricao = (String) payload.get("descricao");

            TransacaoApexPay transacao = facade.depositar(email, valor, descricao);
            return HttpResponse.ok(Map.of(
                    "message", "Depósito realizado com sucesso no ApexPay!",
                    "transacao", transacao,
                    "carteira", facade.getResumoCarteira(email)
            ));
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return HttpResponse.serverError(Map.of("message", "Erro ao processar depósito ApexPay: " + e.getMessage()));
        }
    }

    /**
     * Retorna o extrato e balanço da carteira do usuário logado.
     */
    @Get("/saldo")
    public HttpResponse<?> getSaldo(Principal principal) {
        try {
            return HttpResponse.ok(facade.getResumoCarteira(principal.getName()));
        } catch (Exception e) {
            return HttpResponse.badRequest(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Retorna o extrato detalhado de movimentações (Depósitos, Débitos e Juros).
     */
    @Get("/extrato")
    public HttpResponse<?> getExtrato(Principal principal) {
        try {
            List<TransacaoApexPay> extrato = facade.getExtrato(principal.getName());
            return HttpResponse.ok(extrato);
        } catch (Exception e) {
            return HttpResponse.badRequest(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Aplicação de juros sobre saldo devedor (Inadimplência).
     * Disponível para Agentes Financeiros, Admin ou simulação de rotina de fechamento.
     */
    @Post("/aplicar-juros")
    @Secured({"ROLE_ADMIN", "ROLE_BANCO"})
    public HttpResponse<?> aplicarJuros(@Body Map<String, String> payload) {
        try {
            String email = payload.get("email");
            if (email == null || email.isBlank()) {
                return HttpResponse.badRequest(Map.of("message", "E-mail do usuário é obrigatório."));
            }
            TransacaoApexPay transacao = facade.aplicarJurosInadimplencia(email);
            return HttpResponse.ok(Map.of(
                    "message", "Juros diários de inadimplência aplicados com sucesso!",
                    "transacao", transacao,
                    "carteira", facade.getResumoCarteira(email)
            ));
        } catch (IllegalStateException e) {
            return HttpResponse.badRequest(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return HttpResponse.serverError(Map.of("message", "Erro ao aplicar juros: " + e.getMessage()));
        }
    }

    /**
     * Endpoint protegido para consulta de dados de carteira.
     * Permitido apenas para o próprio usuário ou Agentes de Risco / Administradores.
     */
    @Get("/consulta/{email}")
    @Secured(SecurityRule.IS_AUTHENTICATED)
    public HttpResponse<?> consultarPublico(@PathVariable String email, Authentication authentication) {
        if (authentication == null) {
            return HttpResponse.unauthorized();
        }
        boolean isSelf = authentication.getName().equalsIgnoreCase(email);
        boolean isAdminOrBanco = authentication.getRoles().contains("ROLE_ADMIN") || authentication.getRoles().contains("ROLE_BANCO");
        if (!isSelf && !isAdminOrBanco) {
            return HttpResponse.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Acesso não autorizado aos dados da carteira."));
        }
        try {
            return HttpResponse.ok(facade.getResumoCarteira(email));
        } catch (Exception e) {
            return HttpResponse.notFound(Map.of("message", e.getMessage()));
        }
    }
}
