package com.aluguel.facades;

import com.aluguel.models.Agente;
import com.aluguel.models.Cliente;
import com.aluguel.models.Usuario;
import com.aluguel.repositories.AgenteRepository;
import com.aluguel.repositories.ClienteRepository;
import com.aluguel.repositories.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioFacadeTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private AgenteRepository agenteRepository;

    private ClienteFacade clienteFacade;
    private UsuarioFacade usuarioFacade;

    @BeforeEach
    void setUp() {
        clienteFacade = new ClienteFacade(clienteRepository);
        usuarioFacade = new UsuarioFacade(usuarioRepository, clienteRepository, agenteRepository, clienteFacade);
    }

    @Test
    @DisplayName("Deve registrar um cliente com até 3 rendimentos com sucesso")
    void deveRegistrarClienteComSucesso() {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "CLIENTE");
        data.put("nome", "Gabriel Teste");
        data.put("email", "gabriel@test.com");
        data.put("password", "senha123");
        data.put("cpf", "123.456.789-00");
        data.put("rg", "MG-12.345.678");
        data.put("profissao", "Engenheiro de Software");
        data.put("rendimentos", List.of(
            Map.of("empregadora", "Tech Corp", "valor", "8000.00"),
            Map.of("empregadora", "Freelance", "valor", "2500.00")
        ));

        when(usuarioRepository.findByEmail("gabriel@test.com")).thenReturn(Optional.empty());
        when(clienteRepository.findByCpf("123.456.789-00")).thenReturn(Optional.empty());
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Usuario usuario = usuarioFacade.registrar(data);

        assertNotNull(usuario);
        assertTrue(usuario instanceof Cliente);
        Cliente cliente = (Cliente) usuario;
        assertEquals("Gabriel Teste", cliente.getNome());
        assertEquals("gabriel@test.com", cliente.getEmail());
        assertEquals("ROLE_CLIENTE", cliente.getRole());
        assertEquals("123.456.789-00", cliente.getCpf());
        assertEquals(2, cliente.getRendimentos().size());
        verify(clienteRepository, times(1)).save(any(Cliente.class));
    }

    @Test
    @DisplayName("Deve rejeitar perfil inválido")
    void deveRejeitarPerfilInvalido() {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "SUPER_ADMIN"); // Inválido
        data.put("email", "admin@rentcars.com");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
            usuarioFacade.registrar(data)
        );
        assertTrue(ex.getMessage().contains("Perfil de usuário inválido"));
    }

    @Test
    @DisplayName("Deve rejeitar cadastro com e-mail duplicado")
    void deveRejeitarEmailDuplicado() {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "CLIENTE");
        data.put("email", "duplicado@rentcars.com");

        when(usuarioRepository.findByEmail("duplicado@rentcars.com")).thenReturn(Optional.of(new Cliente()));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
            usuarioFacade.registrar(data)
        );
        assertTrue(ex.getMessage().contains("Já existe um usuário cadastrado com este e-mail"));
    }

    @Test
    @DisplayName("Deve rejeitar cliente com CPF duplicado")
    void deveRejeitarCpfDuplicado() {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "CLIENTE");
        data.put("email", "novo@rentcars.com");
        data.put("cpf", "111.222.333-44");

        when(usuarioRepository.findByEmail("novo@rentcars.com")).thenReturn(Optional.empty());
        when(clienteRepository.findByCpf("111.222.333-44")).thenReturn(Optional.of(new Cliente()));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
            usuarioFacade.registrar(data)
        );
        assertTrue(ex.getMessage().contains("Já existe um cliente cadastrado com este CPF"));
    }

    @Test
    @DisplayName("Deve rejeitar cliente com mais de 3 rendimentos")
    void deveRejeitarMaisDeTresRendimentos() {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "CLIENTE");
        data.put("nome", "Cliente Investidor");
        data.put("email", "investidor@rentcars.com");
        data.put("password", "senha123");
        data.put("cpf", "999.888.777-66");
        data.put("rg", "MG-99.888.777");
        data.put("rendimentos", List.of(
            Map.of("empregadora", "Empresa A", "valor", "1000.00"),
            Map.of("empregadora", "Empresa B", "valor", "2000.00"),
            Map.of("empregadora", "Empresa C", "valor", "3000.00"),
            Map.of("empregadora", "Empresa D", "valor", "4000.00") // 4 rendimentos: excede o limite
        ));

        when(usuarioRepository.findByEmail("investidor@rentcars.com")).thenReturn(Optional.empty());
        when(clienteRepository.findByCpf("999.888.777-66")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
            usuarioFacade.registrar(data)
        );
        assertTrue(ex.getMessage().contains("no máximo 3 rendimentos"));
    }

    @Test
    @DisplayName("Deve registrar agente (Empresa/Banco) com CNPJ com sucesso")
    void deveRegistrarAgenteComSucesso() {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "EMPRESA");
        data.put("nome", "Locadora Alpha");
        data.put("email", "contato@alpha.com");
        data.put("password", "senha123");
        data.put("cnpj", "12.345.678/0001-90");

        when(usuarioRepository.findByEmail("contato@alpha.com")).thenReturn(Optional.empty());
        when(agenteRepository.findByCnpj("12.345.678/0001-90")).thenReturn(Optional.empty());
        when(agenteRepository.save(any(Agente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Usuario agente = usuarioFacade.registrar(data);

        assertNotNull(agente);
        assertTrue(agente instanceof Agente);
        assertEquals("Locadora Alpha", agente.getNome());
        assertEquals("ROLE_EMPRESA", agente.getRole());
        assertEquals("12.345.678/0001-90", ((Agente) agente).getCnpj());
    }
}
