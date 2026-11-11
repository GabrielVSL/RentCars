package com.aluguel.facades;

import com.aluguel.models.*;
import com.aluguel.queue.ReservaQueueEngine;
import com.aluguel.repositories.*;
import jakarta.inject.Singleton;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Singleton
public class AdminDashboardFacade {

    private final PedidoRepository pedidoRepository;
    private final TrackSlotRepository trackSlotRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReservaQueueEngine queueEngine;

    public AdminDashboardFacade(PedidoRepository pedidoRepository,
                                TrackSlotRepository trackSlotRepository,
                                UsuarioRepository usuarioRepository,
                                ReservaQueueEngine queueEngine) {
        this.pedidoRepository = pedidoRepository;
        this.trackSlotRepository = trackSlotRepository;
        this.usuarioRepository = usuarioRepository;
        this.queueEngine = queueEngine;
    }

    public Map<String, Object> getMetricasDashboard() {
        Map<String, Object> kpis = new LinkedHashMap<>();

        // 1. Pedidos e Faturamento Consolidado
        List<Pedido> todosPedidos = StreamSupport.stream(pedidoRepository.findAll().spliterator(), false).toList();
        
        BigDecimal faturamentoTotal = todosPedidos.stream()
                .filter(p -> "APROVADO".equals(p.getStatus()) || "PENDENTE_BANCO".equals(p.getStatus()))
                .map(p -> p.getValorFinal() != null ? p.getValorFinal() : (p.getValorTotal() != null ? p.getValorTotal() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalSessoesAgendadas = todosPedidos.size();
        long sessoesConfirmadas = todosPedidos.stream().filter(p -> "APROVADO".equals(p.getStatus())).count();

        kpis.put("faturamentoTotalBRL", faturamentoTotal);
        kpis.put("totalSessoesAgendadas", totalSessoesAgendadas);
        kpis.put("sessoesConfirmadas", sessoesConfirmadas);

        // 2. Faturamento por Autódromo / Circuito
        Map<String, BigDecimal> faturamentoPorCircuito = new HashMap<>();
        for (Pedido p : todosPedidos) {
            String nomeCircuito = "Desconhecido";
            if (p.getTrackSlot() != null && p.getTrackSlot().getCircuito() != null) {
                nomeCircuito = p.getTrackSlot().getCircuito().getNome();
            } else if (p.getAutomovel() != null && p.getAutomovel().getCircuito() != null) {
                nomeCircuito = p.getAutomovel().getCircuito().getNome();
            }
            BigDecimal valor = p.getValorFinal() != null ? p.getValorFinal() : (p.getValorTotal() != null ? p.getValorTotal() : BigDecimal.ZERO);
            faturamentoPorCircuito.merge(nomeCircuito, valor, BigDecimal::add);
        }
        kpis.put("faturamentoPorCircuito", faturamentoPorCircuito);

        // 3. Taxa de Ocupação dos Boxes por Circuito
        List<TrackSlot> todosSlots = StreamSupport.stream(trackSlotRepository.findAll().spliterator(), false).toList();
        Map<String, Map<String, Object>> ocupacaoBoxes = new HashMap<>();

        for (TrackSlot slot : todosSlots) {
            String circuitoId = slot.getCircuito().getId();
            ocupacaoBoxes.compute(circuitoId, (k, v) -> {
                if (v == null) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("circuitoNome", slot.getCircuito().getNome());
                    map.put("totalVagas", 0);
                    map.put("totalOcupadas", 0);
                    v = map;
                }
                int tv = (int) v.get("totalVagas") + slot.getVagasTotais();
                int to = (int) v.get("totalOcupadas") + slot.getVagasOcupadas();
                v.put("totalVagas", tv);
                v.put("totalOcupadas", to);
                v.put("taxaOcupacaoPercentual", tv > 0 ? Math.round((to * 100.0) / tv) : 0);
                return v;
            });
        }
        kpis.put("ocupacaoBoxesPorAutodromo", ocupacaoBoxes);

        // 4. Supercarros Mais Pilotados
        Map<String, Long> carrosMaisAlugados = todosPedidos.stream()
                .filter(p -> p.getAutomovel() != null)
                .collect(Collectors.groupingBy(p -> p.getAutomovel().getMarca() + " " + p.getAutomovel().getModelo(), Collectors.counting()));
        kpis.put("supercarrosMaisPilotados", carrosMaisAlugados);

        // 5. Métricas Financeiras da Base de Usuários (ApexPay)
        List<Usuario> todosUsuarios = StreamSupport.stream(usuarioRepository.findAll().spliterator(), false).toList();
        long totalUsuarios = todosUsuarios.size();
        long usuariosInadimplentes = todosUsuarios.stream().filter(Usuario::isInadimplente).count();
        long usuariosVipBlack = todosUsuarios.stream().filter(u -> "APEX_BLACK".equals(u.getTierFidelidade())).count();

        BigDecimal saldoTotalCustodia = todosUsuarios.stream()
                .map(u -> u.getSaldoCarteira() != null ? u.getSaldoCarteira() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> metricsApexPay = new HashMap<>();
        metricsApexPay.put("totalPilotosCadastrados", totalUsuarios);
        metricsApexPay.put("pilotosInadimplentes", usuariosInadimplentes);
        metricsApexPay.put("pilotosVipApexBlack", usuariosVipBlack);
        metricsApexPay.put("saldoTotalCustodiadoBRL", saldoTotalCustodia);
        kpis.put("metricasApexPay", metricsApexPay);

        // 6. Monitoramento de Saúde da Fila Assíncrona & DLQ
        kpis.put("saudeMensageriaQueue", queueEngine.getMetricas());

        return kpis;
    }
}
