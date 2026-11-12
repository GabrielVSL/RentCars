package com.aluguel.controllers;

import com.aluguel.facades.AdminDashboardFacade;
import com.aluguel.queue.ReservaQueueEngine;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;

import java.math.BigDecimal;
import java.util.Map;

@Controller("/api/admin")
public class AdminDashboardController {

    private final AdminDashboardFacade facade;
    private final ReservaQueueEngine queueEngine;

    public AdminDashboardController(AdminDashboardFacade facade, ReservaQueueEngine queueEngine) {
        this.facade = facade;
        this.queueEngine = queueEngine;
    }

    @Get("/dashboard")
    @Secured({"ROLE_ADMIN", "ROLE_EMPRESA", "ROLE_BANCO"})
    public HttpResponse<?> getDashboard() {
        return HttpResponse.ok(facade.getMetricasDashboard());
    }

    @Get("/dashboard/publico")
    @Secured(SecurityRule.IS_ANONYMOUS)
    public HttpResponse<?> getDashboardPublico() {
        return HttpResponse.ok(facade.getMetricasDashboard());
    }

    @Post("/clientes/{id}/aplicar-juros")
    @Secured({"ROLE_ADMIN", "ROLE_BANCO"})
    public HttpResponse<?> aplicarJurosCliente(@PathVariable Long id) {
        try {
            return HttpResponse.ok(facade.aplicarJurosCliente(id));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return HttpResponse.badRequest(Map.of("message", e.getMessage()));
        }
    }

    @Post("/pedidos/{id}/sinistro")
    @Secured({"ROLE_ADMIN", "ROLE_EMPRESA", "ROLE_BANCO"})
    public HttpResponse<?> registrarSinistro(@PathVariable Long id, @Body Map<String, Object> payload) {
        try {
            Object valorObj = payload.get("valor");
            if (valorObj == null) {
                return HttpResponse.badRequest(Map.of("message", "Campo 'valor' é obrigatório."));
            }
            BigDecimal valor = new BigDecimal(valorObj.toString());
            String motivo = payload.get("motivo") != null ? payload.get("motivo").toString() : null;
            return HttpResponse.ok(facade.registrarSinistro(id, valor, motivo));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return HttpResponse.badRequest(Map.of("message", e.getMessage()));
        }
    }

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
