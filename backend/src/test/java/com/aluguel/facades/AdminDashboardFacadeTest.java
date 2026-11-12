package com.aluguel.facades;

import com.aluguel.models.*;
import com.aluguel.queue.ReservaQueueEngine;
import com.aluguel.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do Painel Executivo Admin - Lucro, Devedores e Sinistro")
class AdminDashboardFacadeTest {

    @Mock
    private PedidoRepository pedidoRepository;
    @Mock
    private TrackSlotRepository trackSlotRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private TransacaoApexPayRepository transacaoRepository;
    @Mock
    private ReservaQueueEngine queueEngine;
    @Mock
    private ApexPayFacade apexPayFacade;

    private AdminDashboardFacade facade;

    @BeforeEach
    void setUp() {
        facade = new AdminDashboardFacade(
                pedidoRepository,
                trackSlotRepository,
                usuarioRepository,
                transacaoRepository,
                queueEngine,
                apexPayFacade
        );
    }

    @Test
    @DisplayName("Deve calcular lucro líquido estimado e ordenar clientes inadimplentes primeiro")
    void deveCalcularLucroEOrdenarDevedoresPrimeiro() {
        Cliente regular = new Cliente();
        regular.setId(1L);
        regular.setNome("Piloto Regular");
        regular.setEmail("regular@apex.com");
        regular.setRole("ROLE_CLIENTE");
        regular.setSaldoCarteira(new BigDecimal("15000.00"));
        regular.setStatusFinanceiro("REGULAR");

        Cliente devedor = new Cliente();
        devedor.setId(2L);
        devedor.setNome("Piloto Devedor");
        devedor.setEmail("devedor@apex.com");
        devedor.setRole("ROLE_CLIENTE");
        devedor.setSaldoCarteira(new BigDecimal("-4500.00"));
        devedor.setStatusFinanceiro("INADIMPLENTE");

        Circuito interlagos = new Circuito(
                "interlagos", "Interlagos", "Brasil", "SP",
                new BigDecimal("4.309"), 15, "1:10.540", 12
        );
        TrackSlot slot = new TrackSlot(interlagos, LocalDate.now().plusDays(1), "MANHA", 12);
        slot.ocuparVaga();

        Pedido aprovado = new Pedido();
        aprovado.setId(10L);
        aprovado.setTrackingCode("APX-10");
        aprovado.setCliente(regular);
        aprovado.setTrackSlot(slot);
        aprovado.setStatus("APROVADO");
        aprovado.setTipoServico("TRACK_EXPERIENCE");
        aprovado.setValorTotal(new BigDecimal("10000.00"));
        aprovado.setValorFinal(new BigDecimal("10000.00"));
        aprovado.setValorSinistro(new BigDecimal("1000.00"));
        aprovado.setDataInicio(LocalDateTime.now().plusDays(1));
        aprovado.setDataPedido(LocalDateTime.now());

        TransacaoApexPay juros = new TransacaoApexPay(
                devedor, "JUROS_ATRASO", new BigDecimal("45.00"), "Juros 0.1%", null
        );

        when(pedidoRepository.findAll()).thenReturn(List.of(aprovado));
        when(transacaoRepository.findAll()).thenReturn(List.of(juros));
        when(trackSlotRepository.findAll()).thenReturn(List.of(slot));
        when(usuarioRepository.findAll()).thenReturn(List.of(regular, devedor));
        when(queueEngine.getMetricas()).thenReturn(Map.of("pendentes", 0));

        Map<String, Object> kpis = facade.getMetricasDashboard();

        assertEquals(new BigDecimal("10000.00"), kpis.get("faturamentoConfirmadoBRL"));
        // Margem operacional 68% de 10000 = 6800.00 + juros 45.00 + sinistro 1000.00 = 7845.00
        assertEquals(new BigDecimal("7845.00"), kpis.get("lucroLiquidoEstimadoBRL"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> clientes = (List<Map<String, Object>>) kpis.get("clientes");
        assertEquals(2, clientes.size());
        assertTrue((Boolean) clientes.get(0).get("inadimplente"));
        assertEquals("Piloto Devedor", clientes.get(0).get("nome"));
        assertFalse((Boolean) clientes.get(1).get("inadimplente"));
    }

    @Test
    @DisplayName("Deve registrar sinistro em pedido e lançar cobrança no ApexPay do piloto")
    void deveRegistrarSinistroELancarCobrancaApexPay() {
        Cliente cliente = new Cliente();
        cliente.setEmail("piloto@apex.com");

        Pedido pedido = new Pedido();
        pedido.setId(55L);
        pedido.setTrackingCode("APX-55");
        pedido.setCliente(cliente);
        pedido.setValorSinistro(new BigDecimal("500.00"));

        TransacaoApexPay txSinistro = new TransacaoApexPay(
                cliente, "DEBITO_SINISTRO", new BigDecimal("2500.00"), "Avaria asa dianteira", "APX-55"
        );

        when(pedidoRepository.findById(55L)).thenReturn(Optional.of(pedido));
        when(apexPayFacade.lancarCobrancaSinistro(eq("piloto@apex.com"), eq(new BigDecimal("2500.00")), eq("APX-55"), anyString()))
                .thenReturn(txSinistro);
        when(apexPayFacade.getResumoCarteira("piloto@apex.com")).thenReturn(Map.of("inadimplente", true));
        when(pedidoRepository.update(any(Pedido.class))).thenAnswer(i -> i.getArgument(0));

        Map<String, Object> res = facade.registrarSinistro(55L, new BigDecimal("2500.00"), "Avaria asa dianteira");

        assertNotNull(res.get("transacao"));
        assertEquals(new BigDecimal("3000.00"), pedido.getValorSinistro());
        assertEquals("Avaria asa dianteira", pedido.getMotivoSinistro());
        verify(apexPayFacade, times(1))
                .lancarCobrancaSinistro("piloto@apex.com", new BigDecimal("2500.00"), "APX-55", "Avaria asa dianteira");
        verify(pedidoRepository, times(1)).update(pedido);
    }
}
