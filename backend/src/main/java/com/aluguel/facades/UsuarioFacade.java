package com.aluguel.facades;

import com.aluguel.models.*;
import com.aluguel.repositories.*;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import org.mindrot.jbcrypt.BCrypt; // Importe o BCrypt aqui
import java.util.Map;
import java.util.ArrayList;

@Singleton
public class UsuarioFacade {

    private final ClienteRepository clienteRepository;
    private final AgenteRepository agenteRepository;

    public UsuarioFacade(ClienteRepository clienteRepository, AgenteRepository agenteRepository) {
        this.clienteRepository = clienteRepository;
        this.agenteRepository = agenteRepository;
    }

    @Transactional
    public Usuario registrar(Map<String, Object> data) {
        String role = (String) data.get("role");

        if ("CLIENTE".equals(role)) {
            Cliente c = new Cliente();
            preencherDadosBase(c, data);
            c.setCpf((String) data.get("cpf"));
            c.setRg((String) data.get("rg"));
            c.setProfissao((String) data.get("profissao"));
            return clienteRepository.save(c);
        } else {
            Agente a = new Agente();
            preencherDadosBase(a, data);
            a.setCnpj((String) data.get("cnpj"));
            return agenteRepository.save(a);
        }
    }

    private void preencherDadosBase(Usuario u, Map<String, Object> data) {
        u.setNome((String) data.get("nome"));
        u.setEmail((String) data.get("email"));
        u.setEndereco((String) data.get("endereco"));
        u.setRole("ROLE_" + data.get("role"));
        
        // A MÁGICA DA SEGURANÇA: Criptografa a senha antes de enviar para o banco
        String senhaPura = (String) data.get("password");
        String senhaHasheada = BCrypt.hashpw(senhaPura, BCrypt.gensalt());
        u.setSenha(senhaHasheada);
    }
}