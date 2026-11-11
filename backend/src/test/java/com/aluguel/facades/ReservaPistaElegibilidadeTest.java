package com.aluguel.facades;

import com.aluguel.models.*;
import com.aluguel.repositories.*;
import com.aluguel.utils.CnhValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@DisplayName("Testes de Elegibilidade de Pilotagem, CNH Módulo 11 e Vagas de Box (TrackSlot)")
class ReservaPistaElegibilidadeTest {

    private PedidoRepository pedidoRepository;
    private AutomovelRepository automovelRepository;
    private UsuarioRepository usuarioRepository;
    private TrackSlotRepository trackSlotRepository;
    private PedidoFacade pedidoFacade;

    private Automovel automovel;
    private Cliente piloto;

    @BeforeEach
    void setUp() {
        pedidoRepository = Mockito.mock(PedidoRepository.class);
        automovelRepository = Mockito.mock(AutomovelRepository.class);
        usuarioRepository = Mockito.mock(UsuarioRepository.class);
        trackSlotRepository = Mockito.mock(TrackSlotRepository.class);

        pedidoFacade = new PedidoFacade(pedidoRepository, automovelRepository, usuarioRepository, trackSlotRepository);

        automovel = new Automovel();
        automovel.setId(1L);
        automovel.setMarca("Porsche");
        automovel.setModelo("911 GT3 RS");
        automovel.setPrecoPorDia(new BigDecimal("3850.00"));

        piloto = new Cliente();
        piloto.setId(10L);
        piloto.setEmail("piloto@apex.com");
        piloto.setNome("Ayrton Senna Fan");
        piloto.setSaldoCarteira(new BigDecimal("20000.00"));
        piloto.setStatusFinanceiro("REGULAR");
        piloto.setCnhNumero(CnhValidator.CNH_TESTE_OFICIAL);
        piloto.setDataNascimento(LocalDate.of(1995, 3, 21)); // 29+ anos

        when(automovelRepository.findById(1L)).thenReturn(Optional.of(automovel));
        when(usuarioRepository.findByEmail("piloto@apex.com")).thenReturn(Optional.of(piloto));
        when(pedidoRepository.countAlugueisConflitantes(any(), any(), any())).thenReturn(0L);
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    @DisplayName("Deve permitir agendamento de Track Experience quando piloto tem CNH válida e idade >= 21")
    void devePermitirTrackExperienceComCnhValida() {
        Pedido pedido = new Pedido();
        pedido.setAutomovel(automovel);
        pedido.setTipoServico("TRACK_EXPERIENCE");
        pedido.setDataInicio(LocalDateTime.now().plusDays(2));
        pedido.setDataFim(LocalDateTime.now().plusDays(3));

        Pedido criado = pedidoFacade.criarPedido(pedido, "piloto@apex.com");

        assertNotNull(criado);
        assertNotNull(criado.getTrackingCode());
        assertTrue(criado.getTrackingCode().startsWith("APX-"));
        assertEquals("PENDENTE_EMPRESA", criado.getStatus());
    }

    @Test
    @DisplayName("Deve rejeitar Track Experience se o piloto não tiver CNH válida")
    void deveRejeitarTrackExperienceSemCnh() {
        piloto.setCnhNumero("11111111111"); // Inválida no algoritmo

        Pedido pedido = new Pedido();
        pedido.setAutomovel(automovel);
        pedido.setTipoServico("TRACK_EXPERIENCE");
        pedido.setDataInicio(LocalDateTime.now().plusDays(2));
        pedido.setDataFim(LocalDateTime.now().plusDays(3));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                pedidoFacade.criarPedido(pedido, "piloto@apex.com")
        );
        assertTrue(ex.getMessage().contains("CNH"));
    }

    @Test
    @DisplayName("Deve isentar CNH para serviços de visita ao box ou carona rápida (VISITA_BOX e FAST_LAP)")
    void deveIsentarCnhParaVisitaBox() {
        piloto.setCnhNumero(null); // Sem CNH

        Pedido pedido = new Pedido();
        pedido.setAutomovel(automovel);
        pedido.setTipoServico("VISITA_BOX");
        pedido.setDataInicio(LocalDateTime.now().plusDays(2));
        pedido.setDataFim(LocalDateTime.now().plusDays(3));

        Pedido criado = pedidoFacade.criarPedido(pedido, "piloto@apex.com");
        assertNotNull(criado);
        assertEquals("VISITA_BOX", criado.getTipoServico());
    }

    @Test
    @DisplayName("Deve impedir agendamento em TrackSlot quando as vagas de box estiverem esgotadas")
    void deveImpedirSlotLotado() {
        Circuito interlagos = new Circuito();
        interlagos.setId("interlagos");
        interlagos.setNome("Interlagos");

        TrackSlot slotLotado = new TrackSlot(interlagos, LocalDate.now().plusDays(2), "MANHA", 10);
        slotLotado.setId(100L);
        slotLotado.setVagasOcupadas(10); // Esgotado

        when(trackSlotRepository.findById(100L)).thenReturn(Optional.of(slotLotado));

        Pedido pedido = new Pedido();
        pedido.setAutomovel(automovel);
        pedido.setTipoServico("TRACK_EXPERIENCE");
        pedido.setDataInicio(LocalDateTime.now().plusDays(2));
        pedido.setDataFim(LocalDateTime.now().plusDays(3));
        pedido.setTrackSlot(slotLotado);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                pedidoFacade.criarPedido(pedido, "piloto@apex.com")
        );
        assertTrue(ex.getMessage().contains("esgotadas"));
    }
}
