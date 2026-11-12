package com.aluguel.facades;

import com.aluguel.models.*;
import com.aluguel.queue.ReservaQueueEngine;
import com.aluguel.repositories.*;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Singleton
public class AdminDashboardFacade {

    private final PedidoRepository pedidoRepository;
    private final TrackSlotRepository trackSlotRepository;
    private final UsuarioRepository usuarioRepository;
    private final TransacaoApexPayRepository transacaoRepository;
    private final ReservaQueueEngine queueEngine;
    private final ApexPayFacade apexPayFacade;

    public AdminDashboardFacade(PedidoRepository pedidoRepository,
                                TrackSlotRepository trackSlotRepository,
                                UsuarioRepository usuarioRepository,
                                TransacaoApexPayRepository transacaoRepository,
                                ReservaQueueEngine queueEngine,
                                ApexPayFacade apexPayFacade) {
        this.pedidoRepository = pedidoRepository;
        this.trackSlotRepository = trackSlotRepository;
        this.usuarioRepository = usuarioRepository;
        this.transacaoRepository = transacaoRepository;
        this.queueEngine = queueEngine;
        this.apexPayFacade = apexPayFacade;
    }

    public Map<String, Object> getMetricasDashboard() {
        Map<String, Object> kpis = new LinkedHashMap<>();

        // 1. Pedidos, Faturamento e Lucro Operacional
        List<Pedido> todosPedidos = StreamSupport.stream(pedidoRepository.findAll().spliterator(), false)
                .sorted(Comparator.comparing(Pedido::getDataPedido, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        BigDecimal faturamentoConfirmado = todosPedidos.stream()
                .filter(p -> "APROVADO".equals(p.getStatus()))
                .map(p -> p.getValorFinal() != null ? p.getValorFinal() : (p.getValorTotal() != null ? p.getValorTotal() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal faturamentoPendente = todosPedidos.stream()
                .filter(p -> "PENDENTE_EMPRESA".equals(p.getStatus()) || "PENDENTE_BANCO".equals(p.getStatus()) || "REVISAO_CLIENTE".equals(p.getStatus()))
                .map(p -> p.getValorFinal() != null ? p.getValorFinal() : (p.getValorTotal() != null ? p.getValorTotal() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal faturamentoTotal = faturamentoConfirmado.add(faturamentoPendente);

        BigDecimal totalDescontos = todosPedidos.stream()
                .map(p -> p.getDescontoFidelidade() != null ? p.getDescontoFidelidade() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSinistros = todosPedidos.stream()
                .map(p -> p.getValorSinistro() != null ? p.getValorSinistro() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Juros de inadimplência arrecadados
        BigDecimal totalJuros = StreamSupport.stream(transacaoRepository.findAll().spliterator(), false)
                .filter(t -> "JUROS_ATRASO".equals(t.getTipo()))
                .map(TransacaoApexPay::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Lucro líquido estimado (receita confirmada - 32% custo de pista/pneus/combustível + juros + sinistros)
        BigDecimal margemOperacional = faturamentoConfirmado.multiply(new BigDecimal("0.68")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal lucroLiquido = margemOperacional.add(totalJuros).add(totalSinistros);

        long totalSessoesAgendadas = todosPedidos.size();
        long sessoesConfirmadas = todosPedidos.stream().filter(p -> "APROVADO".equals(p.getStatus())).count();
        long sessoesPendentes = todosPedidos.stream()
                .filter(p -> "PENDENTE_EMPRESA".equals(p.getStatus()) || "PENDENTE_BANCO".equals(p.getStatus()))
                .count();

        kpis.put("faturamentoTotalBRL", faturamentoTotal);
        kpis.put("faturamentoConfirmadoBRL", faturamentoConfirmado);
        kpis.put("faturamentoPendenteBRL", faturamentoPendente);
        kpis.put("lucroLiquidoEstimadoBRL", lucroLiquido);
        kpis.put("totalDescontosConcedidosBRL", totalDescontos);
        kpis.put("totalSinistrosCobradosBRL", totalSinistros);
        kpis.put("totalJurosRecebidosBRL", totalJuros);
        kpis.put("totalSessoesAgendadas", totalSessoesAgendadas);
        kpis.put("sessoesConfirmadas", sessoesConfirmadas);
        kpis.put("sessoesPendentes", sessoesPendentes);

        // 2. Faturamento por Autódromo / Circuito
        Map<String, BigDecimal> faturamentoPorCircuito = new HashMap<>();
        for (Pedido p : todosPedidos) {
            String nomeCircuito = resolverNomeCircuito(p);
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

        // 5. Métricas Financeiras da Base de Pilotos (Quem está devendo vs Em dia)
        List<Usuario> clientes = StreamSupport.stream(usuarioRepository.findAll().spliterator(), false)
                .filter(u -> "ROLE_CLIENTE".equals(u.getRole()))
                .toList();

        long totalPilotos = clientes.size();
        long pilotosInadimplentes = clientes.stream().filter(Usuario::isInadimplente).count();
        long pilotosEmDia = totalPilotos - pilotosInadimplentes;
        long pilotosVipBlack = clientes.stream().filter(u -> "APEX_BLACK".equals(u.getTierFidelidade())).count();

        BigDecimal saldoTotalCustodia = clientes.stream()
                .map(u -> u.getSaldoCarteira() != null ? u.getSaldoCarteira() : BigDecimal.ZERO)
                .filter(s -> s.compareTo(BigDecimal.ZERO) > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal dividaAtivaTotal = clientes.stream()
                .map(u -> u.getSaldoCarteira() != null ? u.getSaldoCarteira() : BigDecimal.ZERO)
                .filter(s -> s.compareTo(BigDecimal.ZERO) < 0)
                .map(BigDecimal::abs)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> metricsApexPay = new HashMap<>();
        metricsApexPay.put("totalPilotosCadastrados", totalPilotos);
        metricsApexPay.put("pilotosInadimplentes", pilotosInadimplentes);
        metricsApexPay.put("pilotosEmDia", pilotosEmDia);
        metricsApexPay.put("pilotosVipApexBlack", pilotosVipBlack);
        metricsApexPay.put("saldoTotalCustodiadoBRL", saldoTotalCustodia);
        metricsApexPay.put("dividaAtivaTotalBRL", dividaAtivaTotal);
        kpis.put("metricasApexPay", metricsApexPay);

        // Lista de clientes detalhada (inadimplentes ordenados primeiro)
        List<Map<String, Object>> listaClientes = clientes.stream()
                .sorted(Comparator.comparing(Usuario::isInadimplente).reversed()
                        .thenComparing(u -> u.getSaldoCarteira() != null ? u.getSaldoCarteira() : BigDecimal.ZERO))
                .map(u -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", u.getId());
                    item.put("nome", u.getNome());
                    item.put("email", u.getEmail());
                    item.put("cnhNumero", u.getCnhNumero());
                    item.put("saldoCarteira", u.getSaldoCarteira() != null ? u.getSaldoCarteira() : BigDecimal.ZERO);
                    item.put("totalDepositadoHistorico", u.getTotalDepositadoHistorico() != null ? u.getTotalDepositadoHistorico() : BigDecimal.ZERO);
                    item.put("tierFidelidade", u.getTierFidelidade());
                    item.put("porcentagemDesconto", u.getFatorDesconto().multiply(new BigDecimal("100")).intValue());
                    item.put("statusFinanceiro", u.isInadimplente() ? "INADIMPLENTE" : "REGULAR");
                    item.put("inadimplente", u.isInadimplente());
                    return item;
                })
                .toList();
        kpis.put("clientes", listaClientes);

        // Lista detalhada de agendamentos para o Admin acompanhar e gerenciar
        List<Map<String, Object>> listaAgendamentos = todosPedidos.stream()
                .map(p -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", p.getId());
                    item.put("trackingCode", p.getTrackingCode());
                    item.put("clienteId", p.getCliente() != null ? p.getCliente().getId() : null);
                    item.put("clienteNome", p.getCliente() != null ? p.getCliente().getNome() : "-");
                    item.put("clienteEmail", p.getCliente() != null ? p.getCliente().getEmail() : "-");
                    item.put("clienteInadimplente", p.getCliente() != null && p.getCliente().isInadimplente());
                    item.put("automovelNome", p.getAutomovel() != null ? p.getAutomovel().getMarca() + " " + p.getAutomovel().getModelo() : "Paddock / Sem Veículo");
                    item.put("circuitoNome", resolverNomeCircuito(p));
                    item.put("slotData", p.getTrackSlot() != null ? p.getTrackSlot().getData().toString() : p.getDataInicio().toLocalDate().toString());
                    item.put("slotTurno", p.getTrackSlot() != null ? p.getTrackSlot().getTurno() : "FULL_DAY");
                    item.put("tipoServico", p.getTipoServico());
                    item.put("valorTotal", p.getValorTotal());
                    item.put("descontoFidelidade", p.getDescontoFidelidade());
                    item.put("valorFinal", p.getValorFinal());
                    item.put("valorSinistro", p.getValorSinistro() != null ? p.getValorSinistro() : BigDecimal.ZERO);
                    item.put("motivoSinistro", p.getMotivoSinistro());
                    item.put("formaPagamento", p.getFormaPagamento());
                    item.put("pagamentoStatus", p.getPagamentoStatus());
                    item.put("status", p.getStatus());
                    return item;
                })
                .toList();
        kpis.put("agendamentos", listaAgendamentos);

        // 6. Monitoramento de Saúde da Fila Assíncrona & DLQ
        kpis.put("saudeMensageriaQueue", queueEngine.getMetricas());

        return kpis;
    }

    @Transactional
    public Map<String, Object> aplicarJurosCliente(Long usuarioId) {
        Usuario u = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado."));
        TransacaoApexPay transacao = apexPayFacade.aplicarJurosInadimplencia(u.getEmail());
        return Map.of(
                "message", "Juros diários (0.1%) aplicados com sucesso.",
                "transacao", transacao,
                "carteira", apexPayFacade.getResumoCarteira(u.getEmail())
        );
    }

    @Transactional
    public Map<String, Object> registrarSinistro(Long pedidoId, BigDecimal valor, String motivo) {
        Pedido p = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado."));
        if (p.getCliente() == null) {
            throw new IllegalStateException("Agendamento sem cliente vinculado.");
        }

        TransacaoApexPay transacao = apexPayFacade.lancarCobrancaSinistro(
                p.getCliente().getEmail(), valor, p.getTrackingCode(), motivo
        );

        BigDecimal atual = p.getValorSinistro() != null ? p.getValorSinistro() : BigDecimal.ZERO;
        p.setValorSinistro(atual.add(valor));
        p.setMotivoSinistro(motivo != null && !motivo.isBlank() ? motivo : "Franquia de colisão / avaria em pista");
        pedidoRepository.update(p);

        return Map.of(
                "message", "Franquia / Sinistro registrado na conta ApexPay do piloto.",
                "transacao", transacao,
                "carteiraPiloto", apexPayFacade.getResumoCarteira(p.getCliente().getEmail())
        );
    }

    private String resolverNomeCircuito(Pedido p) {
        if (p.getTrackSlot() != null && p.getTrackSlot().getCircuito() != null) {
            return p.getTrackSlot().getCircuito().getNome();
        }
        if (p.getAutomovel() != null && p.getAutomovel().getCircuito() != null) {
            return p.getAutomovel().getCircuito().getNome();
        }
        return "Circuito Internacional";
    }
}
