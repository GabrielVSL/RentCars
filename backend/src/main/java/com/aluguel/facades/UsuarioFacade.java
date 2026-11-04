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

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final AgenteRepository agenteRepository;
    private final ClienteFacade clienteFacade;

    public UsuarioFacade(UsuarioRepository usuarioRepository,
                         ClienteRepository clienteRepository,
                         AgenteRepository agenteRepository,
                         ClienteFacade clienteFacade) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.agenteRepository = agenteRepository;
        this.clienteFacade = clienteFacade;
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public Usuario registrar(Map<String, Object> data) {
        String role = (String) data.get("role");
        if (role == null || (!role.equals("CLIENTE") && !role.equals("EMPRESA") && !role.equals("BANCO"))) {
            throw new IllegalArgumentException("Perfil de usuário inválido. Escolha CLIENTE, EMPRESA ou BANCO.");
        }

        String email = (String) data.get("email");
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("O e-mail é obrigatório.");
        }
        if (usuarioRepository.findByEmail(email.trim()).isPresent()) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail.");
        }

        if ("CLIENTE".equals(role)) {
            String cpf = (String) data.get("cpf");
            if (cpf == null || cpf.trim().isEmpty()) {
                throw new IllegalArgumentException("O CPF é obrigatório para clientes.");
            }
            if (clienteRepository.findByCpf(cpf.trim()).isPresent()) {
                throw new IllegalArgumentException("Já existe um cliente cadastrado com este CPF.");
            }

            Cliente c = new Cliente();
            preencherDadosBase(c, data);
            c.setCpf(cpf.trim());
            c.setRg((String) data.get("rg"));
            c.setProfissao((String) data.get("profissao"));

            // Lendo e validando rendimentos
            if (data.containsKey("rendimentos") && data.get("rendimentos") != null) {
                List<Map<String, Object>> rendimentosJson = (List<Map<String, Object>>) data.get("rendimentos");
                List<Rendimento> listaRendimentos = new ArrayList<>();

                for (Map<String, Object> item : rendimentosJson) {
                    if (item == null) continue;
                    Rendimento rendimento = new Rendimento();
                    
                    if (item.containsKey("empregadora") && item.get("empregadora") != null) {
                        rendimento.setEmpregadora(item.get("empregadora").toString().trim());
                    }
                    
                    if (item.containsKey("valor") && item.get("valor") != null) {
                        String valStr = item.get("valor").toString().trim();
                        if (!valStr.isEmpty()) {
                            try {
                                rendimento.setValor(new BigDecimal(valStr));
                            } catch (Exception ignored) {}
                        }
                    }
                    
                    if ((rendimento.getEmpregadora() != null && !rendimento.getEmpregadora().isEmpty()) ||
                        (rendimento.getValor() != null && rendimento.getValor().compareTo(BigDecimal.ZERO) > 0)) {
                        listaRendimentos.add(rendimento);
                    }
                }
                
                c.setRendimentos(listaRendimentos);
            }

            clienteFacade.validarRegrasDeNegocio(c);
            return clienteRepository.save(c);
        } else {
            String cnpj = (String) data.get("cnpj");
            if (cnpj == null || cnpj.trim().isEmpty()) {
                throw new IllegalArgumentException("O CNPJ é obrigatório para empresas e bancos.");
            }
            if (agenteRepository.findByCnpj(cnpj.trim()).isPresent()) {
                throw new IllegalArgumentException("Já existe uma instituição cadastrada com este CNPJ.");
            }

            Agente a = new Agente();
            preencherDadosBase(a, data);
            a.setCnpj(cnpj.trim());
            return agenteRepository.save(a);
        }
    }

    private void preencherDadosBase(Usuario u, Map<String, Object> data) {
        String nome = (String) data.get("nome");
        if (nome == null || nome.trim().isEmpty()) {
            throw new IllegalArgumentException("O nome / razão social é obrigatório.");
        }
        u.setNome(nome.trim());
        u.setEmail(((String) data.get("email")).trim());
        u.setEndereco((String) data.get("endereco"));
        u.setRole("ROLE_" + data.get("role"));
        
        String senhaPura = (String) data.get("password");
        if (senhaPura == null || senhaPura.trim().length() < 6) {
            throw new IllegalArgumentException("A senha deve ter no mínimo 6 caracteres.");
        }
        String senhaHasheada = BCrypt.hashpw(senhaPura, BCrypt.gensalt());
        u.setSenha(senhaHasheada);
    }
}
