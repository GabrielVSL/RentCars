package com.aluguel.facades;

import com.aluguel.models.Cliente;
import com.aluguel.models.TransacaoApexPay;
import com.aluguel.models.Usuario;
import com.aluguel.repositories.TransacaoApexPayRepository;
import com.aluguel.repositories.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@DisplayName("Testes do Motor Financeiro ApexPay - Carteira, Fidelidade, Juros e Inadimplência")
class ApexPayEngineTest {

    private UsuarioRepository usuarioRepository;
    private TransacaoApexPayRepository transacaoRepository;
    private ApexPayFacade facade;

    @BeforeEach
    void setUp() {
        usuarioRepository = Mockito.mock(UsuarioRepository.class);
        transacaoRepository = Mockito.mock(TransacaoApexPayRepository.class);
        facade = new ApexPayFacade(usuarioRepository, transacaoRepository);
    }

    @Test
    @DisplayName("Deve creditar saldo e atualizar total depositado e tier de fidelidade")
    void deveCreditarSaldoEAtualizarTier() {
        Cliente cliente = new Cliente();
        cliente.setEmail("piloto@apex.com");
        cliente.setSaldoCarteira(BigDecimal.ZERO);
        cliente.setTotalDepositadoHistorico(BigDecimal.ZERO);

        when(usuarioRepository.findByEmail("piloto@apex.com")).thenReturn(Optional.of(cliente));
        when(transacaoRepository.save(any(TransacaoApexPay.class))).thenAnswer(i -> i.getArgument(0));

        // 1. Depósito de R$ 12.000 -> Deve subir para SILVER (5% desconto)
        facade.depositar("piloto@apex.com", new BigDecimal("12000.00"), "Depósito Inicial");
        assertEquals(new BigDecimal("12000.00"), cliente.getSaldoCarteira());
        assertEquals("SILVER", cliente.getTierFidelidade());
        assertEquals(new BigDecimal("0.05"), cliente.getFatorDesconto());

        // 2. Depósito adicional de R$ 40.000 (total R$ 52.000) -> Deve subir para APEX_BLACK (15% desconto)
        facade.depositar("piloto@apex.com", new BigDecimal("40000.00"), "Upgrade Black");
        assertEquals(new BigDecimal("52000.00"), cliente.getSaldoCarteira());
        assertEquals("APEX_BLACK", cliente.getTierFidelidade());
        assertEquals(new BigDecimal("0.15"), cliente.getFatorDesconto());
    }

    @Test
    @DisplayName("Deve aplicar desconto de fidelidade no débito da reserva")
    void deveAplicarDescontoNoDebito() {
        Cliente cliente = new Cliente();
        cliente.setEmail("vip@apex.com");
        cliente.setSaldoCarteira(new BigDecimal("20000.00"));
        cliente.setTotalDepositadoHistorico(new BigDecimal("60000.00")); // APEX_BLACK (15% de desconto)

        when(usuarioRepository.findByEmail("vip@apex.com")).thenReturn(Optional.of(cliente));
        when(transacaoRepository.save(any(TransacaoApexPay.class))).thenAnswer(i -> i.getArgument(0));

        // Reserva no valor de R$ 10.000,00 com 15% de desconto -> Deve debitar R$ 8.500,00
        TransacaoApexPay transacao = facade.debitarReserva("vip@apex.com", new BigDecimal("10000.00"), "APX-TEST-001", "Reserva Spa");

        assertEquals(new BigDecimal("8500.00"), transacao.getValor());
        assertEquals(new BigDecimal("11500.00"), cliente.getSaldoCarteira());
    }

    @Test
    @DisplayName("Deve bloquear débito e novas reservas se o cliente estiver inadimplente")
    void deveBloquearReservaParaInadimplente() {
        Cliente devedor = new Cliente();
        devedor.setEmail("devedor@apex.com");
        devedor.setSaldoCarteira(new BigDecimal("-1500.00"));
        devedor.setStatusFinanceiro("INADIMPLENTE");

        when(usuarioRepository.findByEmail("devedor@apex.com")).thenReturn(Optional.of(devedor));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                facade.debitarReserva("devedor@apex.com", new BigDecimal("2000.00"), "APX-TEST-002", "Tentativa Inválida")
        );
        assertTrue(ex.getMessage().contains("inadimplente"));
    }

    @Test
    @DisplayName("Deve calcular e aplicar juros diários sobre saldo devedor")
    void deveCalcularJurosDiarios() {
        Cliente devedor = new Cliente();
        devedor.setEmail("devedor@apex.com");
        devedor.setSaldoCarteira(new BigDecimal("-1000.00"));
        devedor.setStatusFinanceiro("INADIMPLENTE");

        when(usuarioRepository.findByEmail("devedor@apex.com")).thenReturn(Optional.of(devedor));
        when(transacaoRepository.save(any(TransacaoApexPay.class))).thenAnswer(i -> i.getArgument(0));

        // Juros de 0.1% sobre 1000.00 = R$ 1.00 de acréscimo à dívida
        TransacaoApexPay transacaoJuros = facade.aplicarJurosInadimplencia("devedor@apex.com");

        assertEquals(new BigDecimal("1.00"), transacaoJuros.getValor());
        assertEquals(new BigDecimal("-1001.00"), devedor.getSaldoCarteira());
    }
}
