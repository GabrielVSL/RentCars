package com.aluguel.facades;

import com.aluguel.models.*;
import com.aluguel.repositories.*;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import org.mindrot.jbcrypt.BCrypt;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;

@Singleton
public class UsuarioFacade {

    private final ClienteRepository clienteRepository;
    private final AgenteRepository agenteRepository;

    public UsuarioFacade(ClienteRepository clienteRepository, AgenteRepository agenteRepository) {
        this.clienteRepository = clienteRepository;
        this.agenteRepository = agenteRepository;
    }

    @Transactional
    @SuppressWarnings("unchecked") // Para evitar alertas do Java ao converter a lista
    public Usuario registrar(Map<String, Object> data) {
        String role = (String) data.get("role");

        if ("CLIENTE".equals(role)) {
            Cliente c = new Cliente();
            preencherDadosBase(c, data);
            c.setCpf((String) data.get("cpf"));
            c.setRg((String) data.get("rg"));
            c.setProfissao((String) data.get("profissao"));

            // --- NOVA LÓGICA: Lendo o Array de Rendimentos do React ---
            if (data.containsKey("rendimentos") && data.get("rendimentos") != null) {
                List<Map<String, Object>> rendimentosJson = (List<Map<String, Object>>) data.get("rendimentos");
                List<Rendimento> listaRendimentos = new ArrayList<>();

                for (Map<String, Object> item : rendimentosJson) {
                    Rendimento rendimento = new Rendimento();
                    
                    if (item.containsKey("empregadora") && item.get("empregadora") != null) {
                        rendimento.setEmpregadora(item.get("empregadora").toString());
                    }
                    
                    if (item.containsKey("valor") && item.get("valor") != null) {
                        rendimento.setValor(new BigDecimal(item.get("valor").toString()));
                    }
                    
                    listaRendimentos.add(rendimento);
                }
                
                c.setRendimentos(listaRendimentos);
            }
            // ----------------------------------------------------------

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
        
        String senhaPura = (String) data.get("password");
        String senhaHasheada = BCrypt.hashpw(senhaPura, BCrypt.gensalt());
        u.setSenha(senhaHasheada);
    }
}