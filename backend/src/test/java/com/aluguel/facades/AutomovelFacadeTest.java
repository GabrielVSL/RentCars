package com.aluguel.facades;

import com.aluguel.models.Automovel;
import com.aluguel.models.Agente;
import com.aluguel.repositories.AutomovelRepository;
import com.aluguel.repositories.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AutomovelFacadeTest {

    @Mock
    private AutomovelRepository automovelRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private AutomovelFacade automovelFacade;

    @BeforeEach
    void setUp() {
        automovelFacade = new AutomovelFacade(automovelRepository, usuarioRepository);
    }

    @Test
    @DisplayName("Deve cadastrar veículo associando ao proprietário logado")
    void deveCriarAutomovelComSucesso() {
        Agente empresa = new Agente();
        empresa.setEmail("locadora@rentcars.com");

        Automovel novoCarro = new Automovel();
        novoCarro.setMarca("BMW");
        novoCarro.setModelo("320i");
        novoCarro.setPrecoPorDia(new BigDecimal("350.00"));

        when(usuarioRepository.findByEmail("locadora@rentcars.com")).thenReturn(Optional.of(empresa));
        when(automovelRepository.save(any(Automovel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Automovel salvo = automovelFacade.criar(novoCarro, "locadora@rentcars.com");

        assertNotNull(salvo);
        assertEquals(empresa, salvo.getProprietario());
        verify(automovelRepository, times(1)).save(novoCarro);
    }

    @Test
    @DisplayName("Deve permitir que apenas o proprietário altere seu próprio veículo")
    void deveImpedirEdicaoPorTerceiros() {
        Agente donoOriginal = new Agente();
        donoOriginal.setEmail("dono@rentcars.com");

        Automovel carro = new Automovel();
        carro.setId(50L);
        carro.setProprietario(donoOriginal);

        Automovel dadosNovos = new Automovel();
        dadosNovos.setMarca("Porsche");

        when(automovelRepository.findById(50L)).thenReturn(Optional.of(carro));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
            automovelFacade.atualizar(50L, dadosNovos, "hacker@rentcars.com")
        );
        assertTrue(ex.getMessage().contains("não tem permissão para editar"));
    }

    @Test
    @DisplayName("Deve permitir que apenas o proprietário exclua seu próprio veículo")
    void deveImpedirExclusaoPorTerceiros() {
        Agente donoOriginal = new Agente();
        donoOriginal.setEmail("dono@rentcars.com");

        Automovel carro = new Automovel();
        carro.setId(50L);
        carro.setProprietario(donoOriginal);

        when(automovelRepository.findById(50L)).thenReturn(Optional.of(carro));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
            automovelFacade.deletar(50L, "invasor@rentcars.com")
        );
        assertTrue(ex.getMessage().contains("não tem permissão para excluir"));
    }

    @Test
    @DisplayName("Deve listar automóveis pertencentes ao proprietário")
    void deveListarPorProprietario() {
        Automovel carro1 = new Automovel();
        carro1.setModelo("Corolla");
        Automovel carro2 = new Automovel();
        carro2.setModelo("Civic");

        when(automovelRepository.findByProprietarioEmail("locadora@rentcars.com")).thenReturn(List.of(carro1, carro2));

        List<Automovel> frota = automovelFacade.listarPorProprietario("locadora@rentcars.com");

        assertEquals(2, frota.size());
        assertEquals("Corolla", frota.get(0).getModelo());
        assertEquals("Civic", frota.get(1).getModelo());
    }

    @Test
    @DisplayName("Deve buscar automóvel por ID ou lançar exceção quando inexistente")
    void deveBuscarPorIdOuLancarExcecao() {
        Automovel carro = new Automovel();
        carro.setId(7L);
        carro.setModelo("911 GT3 RS (992)");

        when(automovelRepository.findById(7L)).thenReturn(Optional.of(carro));
        when(automovelRepository.findById(999L)).thenReturn(Optional.empty());

        Automovel encontrado = automovelFacade.buscarPorId(7L);
        assertEquals("911 GT3 RS (992)", encontrado.getModelo());

        assertThrows(IllegalArgumentException.class, () -> automovelFacade.buscarPorId(999L));
    }
}
