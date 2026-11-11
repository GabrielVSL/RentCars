package com.aluguel.queue;

import com.aluguel.facades.PedidoFacade;
import com.aluguel.models.Automovel;
import com.aluguel.models.Pedido;
import com.aluguel.models.TrackSlot;
import io.micronaut.context.annotation.Value;
import jakarta.annotation.PreDestroy;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

@Singleton
public class ReservaQueueEngine {

    private static final Logger LOG = LoggerFactory.getLogger(ReservaQueueEngine.class);

    private final PedidoFacade pedidoFacade;
    private final int maxRetries;
    private final String dlqName;

    private final BlockingQueue<ReservaMensagem> filaPrincipal = new LinkedBlockingQueue<>();
    private final List<ReservaMensagem> deadLetterQueue = new CopyOnWriteArrayList<>();
    
    private final AtomicLong totalEnfileiradas = new AtomicLong(0);
    private final AtomicLong totalSucessos = new AtomicLong(0);
    private final AtomicLong totalFalhas = new AtomicLong(0);
    private final AtomicLong totalDlq = new AtomicLong(0);

    private final ScheduledExecutorService workerExecutor;
    private volatile boolean rodando = true;

    public ReservaQueueEngine(PedidoFacade pedidoFacade,
                              @Value("${apex.queue.max-retries:3}") int maxRetries,
                              @Value("${apex.queue.dlq-name:apex.reservas.dlq}") String dlqName) {
        this.pedidoFacade = pedidoFacade;
        this.maxRetries = maxRetries;
        this.dlqName = dlqName;

        // Inicia o consumidor assíncrono em Virtual Thread (Java 21)
        this.workerExecutor = Executors.newScheduledThreadPool(2, Thread.ofVirtual().factory());
        iniciarConsumidor();
    }

    /**
     * Enfileira uma pré-reserva para processamento assíncrono com resposta HTTP 202 imediata.
     */
    public ReservaMensagem enfileirar(ReservaMensagem msg) {
        if (msg.getTrackingId() == null || msg.getTrackingId().isBlank()) {
            msg.setTrackingId("APX-ASYNC-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        }
        msg.setStatus("PENDENTE");
        filaPrincipal.offer(msg);
        totalEnfileiradas.incrementAndGet();
        LOG.info("📥 [Apex Queue] Reserva enfileirada: {} | Cliente: {}", msg.getTrackingId(), msg.getEmailCliente());
        return msg;
    }

    private void iniciarConsumidor() {
        workerExecutor.execute(() -> {
            LOG.info("🚀 [Apex Queue] Motor de mensageria assíncrona iniciado via Java 21 Virtual Threads.");
            while (rodando) {
                try {
                    ReservaMensagem msg = filaPrincipal.take(); // Bloqueante não ocupado
                    processarMensagem(msg);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    LOG.error("Erro inesperado no loop da fila: {}", e.getMessage(), e);
                }
            }
        });
    }

    private void processarMensagem(ReservaMensagem msg) {
        msg.incrementarTentativa();
        msg.setStatus("PROCESSANDO");
        LOG.info("⚙️ [Apex Queue] Processando {} (Tentativa {}/{})", msg.getTrackingId(), msg.getTentativas(), maxRetries);

        try {
            Pedido pedido = new Pedido();
            Automovel auto = new Automovel();
            auto.setId(msg.getAutomovelId());
            pedido.setAutomovel(auto);
            pedido.setTipoServico(msg.getTipoServico());
            pedido.setDataInicio(msg.getDataInicio());
            pedido.setDataFim(msg.getDataFim());

            if (msg.getSlotId() != null) {
                TrackSlot slot = new TrackSlot();
                slot.setId(msg.getSlotId());
                pedido.setTrackSlot(slot);
            }

            pedidoFacade.criarPedido(pedido, msg.getEmailCliente());
            
            msg.setStatus("CONCLUIDO");
            totalSucessos.incrementAndGet();
            LOG.info("✅ [Apex Queue] Reserva confirmada com sucesso: {}", msg.getTrackingId());

        } catch (Exception e) {
            totalFalhas.incrementAndGet();
            msg.setMotivoFalha(e.getMessage());
            LOG.warn("⚠️ [Apex Queue] Falha ao processar {}: {}", msg.getTrackingId(), e.getMessage());

            if (msg.getTentativas() < maxRetries) {
                // Backoff Exponencial: 1s, 2s, 4s...
                long backoffMs = (long) Math.pow(2, msg.getTentativas() - 1) * 1000L;
                LOG.info("⏳ [Apex Queue] Agendando retentativa para {} em {} ms...", msg.getTrackingId(), backoffMs);
                workerExecutor.schedule(() -> filaPrincipal.offer(msg), backoffMs, TimeUnit.MILLISECONDS);
            } else {
                // Esgotou tentativas -> Move para a Dead Letter Queue (DLQ)
                msg.setStatus("DLQ");
                deadLetterQueue.add(msg);
                totalDlq.incrementAndGet();
                LOG.error("🚨 [Apex DLQ] Mensagem transferida para Dead Letter Queue ({}): {} | Causa: {}",
                        dlqName, msg.getTrackingId(), msg.getMotivoFalha());
            }
        }
    }

    public Map<String, Object> getMetricas() {
        Map<String, Object> metricas = new HashMap<>();
        metricas.put("motor", "Apex Resilient Virtual Threads Queue");
        metricas.put("status", rodando ? "ONLINE" : "PARADO");
        metricas.put("tamanhoFilaAtual", filaPrincipal.size());
        metricas.put("tamanhoDlqAtual", deadLetterQueue.size());
        metricas.put("totalEnfileiradas", totalEnfileiradas.get());
        metricas.put("totalSucessos", totalSucessos.get());
        metricas.put("totalFalhas", totalFalhas.get());
        metricas.put("totalDlq", totalDlq.get());
        metricas.put("maxTentativasConfigurado", maxRetries);
        metricas.put("dlqNome", dlqName);
        
        // Últimos 5 itens da DLQ para inspeção
        List<ReservaMensagem> ultimosDlq = deadLetterQueue.stream()
                .skip(Math.max(0, deadLetterQueue.size() - 5))
                .toList();
        metricas.put("ultimosItensDlq", ultimosDlq);

        return metricas;
    }

    public List<ReservaMensagem> getDeadLetterQueue() {
        return Collections.unmodifiableList(deadLetterQueue);
    }

    @PreDestroy
    public void encerrar() {
        rodando = false;
        workerExecutor.shutdownNow();
    }
}
