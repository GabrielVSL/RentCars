package com.aluguel.facades;

import com.aluguel.models.*;
import com.aluguel.repositories.*;
import com.aluguel.utils.CnhValidator;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import org.mindrot.jbcrypt.BCrypt;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        String rawRole = data.get("role") != null ? data.get("role").toString().trim().toUpperCase() : "CLIENTE";
        if (rawRole.isEmpty()) {
            rawRole = "CLIENTE";
        }
        if (!"CLIENTE".equals(rawRole)) {
            throw new IllegalArgumentException("Perfil de usuário inválido. O cadastro público é exclusivo para Pilotos/Clientes Apex.");
        }
        data.put("role", "CLIENTE");

        String email = (String) data.get("email");
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("O e-mail é obrigatório.");
        }
        if (usuarioRepository.findByEmail(email.trim()).isPresent()) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail.");
        }

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

        // Dados opcionais de CNH / data de nascimento no momento do cadastro
        if (data.get("cnhNumero") != null && !data.get("cnhNumero").toString().isBlank()) {
            String cnhLimpa = data.get("cnhNumero").toString().replaceAll("\\D", "");
            if (!CnhValidator.isValid(cnhLimpa)) {
                throw new IllegalArgumentException("Número de CNH inválido pelo algoritmo oficial (Módulo 11).");
            }
            c.setCnhNumero(cnhLimpa);
            c.setCnhCategoria(data.get("cnhCategoria") != null ? data.get("cnhCategoria").toString() : "B");
        }
        if (data.get("dataNascimento") != null && !data.get("dataNascimento").toString().isBlank()) {
            c.setDataNascimento(LocalDate.parse(data.get("dataNascimento").toString()));
        }

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
    }

    public Map<String, Object> buscarPerfil(String email) {
        Usuario u = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        Map<String, Object> perfil = new HashMap<>();
        perfil.put("id", u.getId());
        perfil.put("nome", u.getNome());
        perfil.put("email", u.getEmail());
        perfil.put("role", u.getRole());
        perfil.put("cnhNumero", u.getCnhNumero());
        perfil.put("cnhCategoria", u.getCnhCategoria());
        perfil.put("dataNascimento", u.getDataNascimento());
        perfil.put("saldoCarteira", u.getSaldoCarteira() != null ? u.getSaldoCarteira() : BigDecimal.ZERO);
        perfil.put("totalDepositadoHistorico", u.getTotalDepositadoHistorico() != null ? u.getTotalDepositadoHistorico() : BigDecimal.ZERO);
        perfil.put("statusFinanceiro", u.getStatusFinanceiro() != null ? u.getStatusFinanceiro() : "REGULAR");
        perfil.put("inadimplente", u.isInadimplente());
        perfil.put("tierFidelidade", u.getTierFidelidade());
        perfil.put("porcentagemDesconto", u.getFatorDesconto().multiply(new BigDecimal("100")).intValue());
        return perfil;
    }

    @Transactional
    public Map<String, Object> atualizarHabilitacao(String email, String cnhNumero, String cnhCategoria, String dataNascimento) {
        Usuario u = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (cnhNumero == null || !CnhValidator.isValid(cnhNumero)) {
            throw new IllegalArgumentException("CNH inválida pelo algoritmo oficial (Módulo 11). Para testes utilize: " + CnhValidator.CNH_TESTE_OFICIAL);
        }
        String cnhLimpa = cnhNumero.replaceAll("\\D", "");
        u.setCnhNumero(cnhLimpa);
        u.setCnhCategoria(cnhCategoria != null && !cnhCategoria.isBlank() ? cnhCategoria.toUpperCase() : "B");

        if (dataNascimento != null && !dataNascimento.isBlank()) {
            LocalDate nascimento = LocalDate.parse(dataNascimento);
            long idade = ChronoUnit.YEARS.between(nascimento, LocalDate.now());
            if (idade < 21) {
                throw new IllegalArgumentException("Idade mínima de 21 anos exigida para pilotagem em pista.");
            }
            u.setDataNascimento(nascimento);
        }

        usuarioRepository.update(u);
        return buscarPerfil(email);
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
