package com.aluguel.controllers;

import com.aluguel.facades.AdminDashboardFacade;
import com.aluguel.queue.ReservaQueueEngine;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;

import java.util.Map;

@Controller("/api/admin")
public class AdminDashboardController {

    private final AdminDashboardFacade facade;
    private final ReservaQueueEngine queueEngine;

    public AdminDashboardController(AdminDashboardFacade facade, ReservaQueueEngine queueEngine) {
        this.facade = facade;
        this.queueEngine = queueEngine;
    }

    /**
     * Dashboard Executivo Completo para Diretores de Prova, Admins e Agentes Financeiros.
     */
    @Get("/dashboard")
    @Secured({"ROLE_ADMIN", "ROLE_EMPRESA", "ROLE_BANCO"})
    public HttpResponse<?> getDashboard() {
        return HttpResponse.ok(facade.getMetricasDashboard());
    }

    /**
     * Demonstração Pública do Dashboard (Permite a recrutadores inspecionarem os KPIs em tempo real).
     */
    @Get("/dashboard/publico")
    @Secured(SecurityRule.IS_ANONYMOUS)
    public HttpResponse<?> getDashboardPublico() {
        return HttpResponse.ok(facade.getMetricasDashboard());
    }

    /**
     * Inspeção direta dos itens na Dead Letter Queue (DLQ).
     */
    @Get("/queue/dlq")
    @Secured({"ROLE_ADMIN", "ROLE_BANCO"})
    public HttpResponse<?> getDeadLetterQueue() {
        return HttpResponse.ok(Map.of(
                "dlqNome", "apex.reservas.dlq",
                "totalItens", queueEngine.getDeadLetterQueue().size(),
                "itens", queueEngine.getDeadLetterQueue()
        ));
    }
}
