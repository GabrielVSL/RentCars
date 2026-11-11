package com.aluguel.facades;

import com.aluguel.models.Agente;
import com.aluguel.models.Automovel;
import com.aluguel.models.Cliente;
import com.aluguel.models.Pedido;
import com.aluguel.repositories.AutomovelRepository;
import com.aluguel.repositories.PedidoRepository;
import com.aluguel.repositories.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoFacadeTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private AutomovelRepository automovelRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private PedidoFacade pedidoFacade;

    @BeforeEach
    void setUp() {
        pedidoFacade = new PedidoFacade(pedidoRepository, automovelRepository, usuarioRepository);
    }

    @Test
    @DisplayName("Deve criar pedido calculando valor total com sucesso e status PENDENTE_EMPRESA")
    void deveCriarPedidoComSucesso() {
        Agente empresa = new Agente();
        empresa.setEmail("empresa@rentcars.com");

        Automovel automovel = new Automovel();
        automovel.setId(10L);
        automovel.setPrecoPorDia(new BigDecimal("150.00"));
        automovel.setProprietario(empresa);

        Cliente cliente = new Cliente();
        cliente.setId(1L);
        cliente.setEmail("cliente@rentcars.com");
        cliente.setCnhNumero("52798802310");
        cliente.setDataNascimento(LocalDate.of(1995, 1, 1));
        cliente.setStatusFinanceiro("REGULAR");

        Pedido pedidoInput = new Pedido();
        pedidoInput.setAutomovel(automovel);
        pedidoInput.setDataInicio(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
        pedidoInput.setDataFim(LocalDateTime.now().plusDays(4).withHour(10).withMinute(0)); // 3 diárias

        when(automovelRepository.findById(10L)).thenReturn(Optional.of(automovel));
        when(pedidoRepository.countAlugueisConflitantes(eq(10L), any(), any())).thenReturn(0L);
        when(usuarioRepository.findByEmail("cliente@rentcars.com")).thenReturn(Optional.of(cliente));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Pedido criado = pedidoFacade.criarPedido(pedidoInput, "cliente@rentcars.com");

        assertNotNull(criado);
        assertEquals("PENDENTE_EMPRESA", criado.getStatus());
        assertEquals(automovel, criado.getAutomovel());
        assertEquals(cliente, criado.getCliente());
        // 3 diárias * 150 = 450.00
        assertEquals(new BigDecimal("450.00"), criado.getValorTotal());
        verify(pedidoRepository, times(1)).save(any(Pedido.class));
    }

    @Test
    @DisplayName("Deve rejeitar criação de pedido se data de fim for anterior à data de início")
    void deveRejeitarDatasInvertidas() {
        Automovel automovel = new Automovel();
        automovel.setId(10L);

        Pedido pedidoInput = new Pedido();
        pedidoInput.setAutomovel(automovel);
        pedidoInput.setDataInicio(LocalDateTime.now().plusDays(5));
        pedidoInput.setDataFim(LocalDateTime.now().plusDays(2)); // Erro: fim antes do início

        when(automovelRepository.findById(10L)).thenReturn(Optional.of(automovel));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
            pedidoFacade.criarPedido(pedidoInput, "cliente@rentcars.com")
        );
        assertTrue(ex.getMessage().contains("A data de devolução não pode ser anterior"));
    }

    @Test
    @DisplayName("Deve rejeitar criação de pedido com data de início no passado")
    void deveRejeitarDataNoPassado() {
        Automovel automovel = new Automovel();
        automovel.setId(10L);

        Pedido pedidoInput = new Pedido();
        pedidoInput.setAutomovel(automovel);
        pedidoInput.setDataInicio(LocalDateTime.now().minusDays(2));
        pedidoInput.setDataFim(LocalDateTime.now().plusDays(2));

        when(automovelRepository.findById(10L)).thenReturn(Optional.of(automovel));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
            pedidoFacade.criarPedido(pedidoInput, "cliente@rentcars.com")
        );
        assertTrue(ex.getMessage().contains("não pode iniciar no passado"));
    }

    @Test
    @DisplayName("Deve bloquear criação de pedido se houver conflito de overbooking")
    void deveBloquearOverbooking() {
        Automovel automovel = new Automovel();
        automovel.setId(10L);

        Pedido pedidoInput = new Pedido();
        pedidoInput.setAutomovel(automovel);
        pedidoInput.setDataInicio(LocalDateTime.now().plusDays(2));
        pedidoInput.setDataFim(LocalDateTime.now().plusDays(5));

        when(automovelRepository.findById(10L)).thenReturn(Optional.of(automovel));
        when(pedidoRepository.countAlugueisConflitantes(eq(10L), any(), any())).thenReturn(1L); // Conflito existente

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
            pedidoFacade.criarPedido(pedidoInput, "cliente@rentcars.com")
        );
        assertTrue(ex.getMessage().contains("já está reservado"));
    }

    @Test
    @DisplayName("Empresa deve aprovar pedido movendo status de PENDENTE_EMPRESA para PENDENTE_BANCO")
    void deveEmpresaAprovarPedido() {
        Agente empresa = new Agente();
        empresa.setEmail("proprietaria@rentcars.com");
        empresa.setRole("ROLE_EMPRESA");

        Automovel automovel = new Automovel();
        automovel.setId(10L);
        automovel.setProprietario(empresa);

        Pedido pedido = new Pedido();
        pedido.setId(100L);
        pedido.setStatus("PENDENTE_EMPRESA");
        pedido.setAutomovel(automovel);

        when(pedidoRepository.findById(100L)).thenReturn(Optional.of(pedido));
        when(usuarioRepository.findByEmail("proprietaria@rentcars.com")).thenReturn(Optional.of(empresa));
        when(pedidoRepository.update(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Pedido atualizado = pedidoFacade.avaliarPedido(100L, "proprietaria@rentcars.com", "APROVADO");

        assertEquals("PENDENTE_BANCO", atualizado.getStatus());
        verify(pedidoRepository, times(1)).update(pedido);
    }

    @Test
    @DisplayName("Banco deve aprovar pedido movendo status de PENDENTE_BANCO para APROVADO")
    void deveBancoAprovarPedido() {
        Agente banco = new Agente();
        banco.setEmail("agente@banco.com");
        banco.setRole("ROLE_BANCO");

        Pedido pedido = new Pedido();
        pedido.setId(101L);
        pedido.setStatus("PENDENTE_BANCO");

        when(pedidoRepository.findById(101L)).thenReturn(Optional.of(pedido));
        when(usuarioRepository.findByEmail("agente@banco.com")).thenReturn(Optional.of(banco));
        when(pedidoRepository.update(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Pedido atualizado = pedidoFacade.avaliarPedido(101L, "agente@banco.com", "APROVADO");

        assertEquals("APROVADO", atualizado.getStatus());
        verify(pedidoRepository, times(1)).update(pedido);
    }

    @Test
    @DisplayName("Rejeição em qualquer etapa deve marcar o pedido como REJEITADO")
    void deveRejeitarPedido() {
        Agente empresa = new Agente();
        empresa.setEmail("proprietaria@rentcars.com");
        empresa.setRole("ROLE_EMPRESA");

        Automovel automovel = new Automovel();
        automovel.setId(10L);
        automovel.setProprietario(empresa);

        Pedido pedido = new Pedido();
        pedido.setId(102L);
        pedido.setStatus("PENDENTE_EMPRESA");
        pedido.setAutomovel(automovel);

        when(pedidoRepository.findById(102L)).thenReturn(Optional.of(pedido));
        when(usuarioRepository.findByEmail("proprietaria@rentcars.com")).thenReturn(Optional.of(empresa));
        when(pedidoRepository.update(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Pedido atualizado = pedidoFacade.avaliarPedido(102L, "proprietaria@rentcars.com", "REJEITADO");

        assertEquals("REJEITADO", atualizado.getStatus());
    }

    @Test
    @DisplayName("Empresa deve conseguir emitir contraproposta recalculando valor e movendo para REVISAO_CLIENTE")
    void deveEmitirContrapropostaComRecalculo() {
        Agente empresa = new Agente();
        empresa.setEmail("empresa@rentcars.com");
        empresa.setRole("ROLE_EMPRESA");

        Automovel automovel = new Automovel();
        automovel.setId(10L);
        automovel.setPrecoPorDia(new BigDecimal("200.00"));
        automovel.setProprietario(empresa);

        Pedido pedido = new Pedido();
        pedido.setId(103L);
        pedido.setStatus("PENDENTE_EMPRESA");
        pedido.setAutomovel(automovel);

        LocalDateTime novaInicio = LocalDateTime.now().plusDays(2);
        LocalDateTime novaFim = LocalDateTime.now().plusDays(4); // 2 diárias

        Pedido dadosModificados = new Pedido();
        dadosModificados.setDataInicio(novaInicio);
        dadosModificados.setDataFim(novaFim);

        when(pedidoRepository.findById(103L)).thenReturn(Optional.of(pedido));
        when(usuarioRepository.findByEmail("empresa@rentcars.com")).thenReturn(Optional.of(empresa));
        when(pedidoRepository.countAlugueisConflitantesExcluindoPedido(eq(10L), eq(103L), any(), any())).thenReturn(0L);
        when(pedidoRepository.update(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Pedido atualizado = pedidoFacade.modificarPedidoAgente(103L, "empresa@rentcars.com", dadosModificados);

        assertEquals("REVISAO_CLIENTE", atualizado.getStatus());
        assertEquals(new BigDecimal("400.00"), atualizado.getValorTotal());
        assertEquals(novaInicio, atualizado.getDataInicio());
        assertEquals(novaFim, atualizado.getDataFim());
    }

    @Test
    @DisplayName("Cliente deve conseguir aceitar contraproposta movendo para PENDENTE_BANCO")
    void deveClienteAceitarContraproposta() {
        Cliente cliente = new Cliente();
        cliente.setEmail("cliente@rentcars.com");

        Pedido pedido = new Pedido();
        pedido.setId(104L);
        pedido.setStatus("REVISAO_CLIENTE");
        pedido.setCliente(cliente);

        when(pedidoRepository.findById(104L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.update(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Pedido atualizado = pedidoFacade.responderContrapropostaCliente(104L, "cliente@rentcars.com", true);

        assertEquals("PENDENTE_BANCO", atualizado.getStatus());
    }

    @Test
    @DisplayName("Cliente deve conseguir cancelar pedido pendente que pertence a ele")
    void deveClienteCancelarPedido() {
        Cliente cliente = new Cliente();
        cliente.setEmail("cliente@rentcars.com");

        Pedido pedido = new Pedido();
        pedido.setId(105L);
        pedido.setStatus("PENDENTE_EMPRESA");
        pedido.setCliente(cliente);

        when(pedidoRepository.findById(105L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.update(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Pedido cancelado = pedidoFacade.cancelarPedidoCliente(105L, "cliente@rentcars.com");

        assertEquals("CANCELADO", cancelado.getStatus());
    }
}
