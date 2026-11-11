package com.aluguel.facades;

import com.aluguel.models.Cliente;
import com.aluguel.models.Rendimento;
import com.aluguel.repositories.ClienteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClienteFacadeTest {

    @Mock
    private ClienteRepository clienteRepository;

    private ClienteFacade clienteFacade;

    @BeforeEach
    void setUp() {
        clienteFacade = new ClienteFacade(clienteRepository);
    }

    @Test
    @DisplayName("Deve validar regras de negócio obrigatórias (Nome, CPF, RG)")
    void deveValidarCamposObrigatorios() {
        Cliente semNome = new Cliente();
        semNome.setCpf("123.456.789-00");
        semNome.setRg("MG-123456");

        IllegalArgumentException exNome = assertThrows(IllegalArgumentException.class, () ->
            clienteFacade.validarRegrasDeNegocio(semNome)
        );
        assertTrue(exNome.getMessage().contains("O nome do cliente é obrigatório"));

        Cliente semCpf = new Cliente();
        semCpf.setNome("João");
        semCpf.setRg("MG-123456");

        IllegalArgumentException exCpf = assertThrows(IllegalArgumentException.class, () ->
            clienteFacade.validarRegrasDeNegocio(semCpf)
        );
        assertTrue(exCpf.getMessage().contains("O CPF é obrigatório"));

        Cliente semRg = new Cliente();
        semRg.setNome("João");
        semRg.setCpf("123.456.789-00");

        IllegalArgumentException exRg = assertThrows(IllegalArgumentException.class, () ->
            clienteFacade.validarRegrasDeNegocio(semRg)
        );
        assertTrue(exRg.getMessage().contains("O RG é obrigatório"));
    }

    @Test
    @DisplayName("Deve remover rendimentos em branco e aceitar até 3 rendimentos")
    void deveSanitizarRendimentos() {
        Cliente cliente = new Cliente();
        cliente.setNome("Maria Silva");
        cliente.setCpf("111.222.333-44");
        cliente.setRg("SP-123456");

        List<Rendimento> rendimentos = new ArrayList<>();
        
        Rendimento valido = new Rendimento();
        valido.setEmpregadora("Empresa X");
        valido.setValor(new BigDecimal("5000.00"));
        rendimentos.add(valido);

        Rendimento emBranco = new Rendimento();
        emBranco.setEmpregadora("");
        emBranco.setValor(BigDecimal.ZERO);
        rendimentos.add(emBranco);

        cliente.setRendimentos(rendimentos);

        when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Cliente salvo = clienteFacade.criar(cliente);

        assertEquals(1, salvo.getRendimentos().size());
        assertEquals("Empresa X", salvo.getRendimentos().get(0).getEmpregadora());
    }

    @Test
    @DisplayName("Deve excluir cliente quando ID existir")
    void deveExcluirClienteExistente() {
        when(clienteRepository.existsById(10L)).thenReturn(true);
        doNothing().when(clienteRepository).deleteById(10L);

        boolean excluido = clienteFacade.excluir(10L);

        assertTrue(excluido);
        verify(clienteRepository, times(1)).deleteById(10L);
    }
}
