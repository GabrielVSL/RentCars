package com.aluguel.security;

import com.aluguel.models.*;
import com.aluguel.repositories.*;
import io.micronaut.context.event.StartupEvent;
import io.micronaut.runtime.event.annotation.EventListener;
import jakarta.inject.Singleton;
import org.mindrot.jbcrypt.BCrypt;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Singleton
public class DataInitializer {

    private final UsuarioRepository usuarioRepository;
    private final AgenteRepository agenteRepository;
    private final ClienteRepository clienteRepository;
    private final AutomovelRepository automovelRepository;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           AgenteRepository agenteRepository,
                           ClienteRepository clienteRepository,
                           AutomovelRepository automovelRepository) {
        this.usuarioRepository = usuarioRepository;
        this.agenteRepository = agenteRepository;
        this.clienteRepository = clienteRepository;
        this.automovelRepository = automovelRepository;
    }

    @EventListener
    public void onStartup(StartupEvent event) {
        // Se ainda não houver usuários cadastrados, inicializa os perfis padrão para teste
        if (usuarioRepository.count() == 0) {
            String senhaPadrao = BCrypt.hashpw("123456", BCrypt.gensalt());

            // 1. Empresa / Locadora Padrão
            Agente empresa = new Agente();
            empresa.setNome("Localiza Prime Motors");
            empresa.setEmail("empresa@rentcars.com");
            empresa.setSenha(senhaPadrao);
            empresa.setRole("ROLE_EMPRESA");
            empresa.setEndereco("Av. Raja Gabaglia, 2000 - Belo Horizonte, MG");
            empresa.setCnpj("12345678000199");
            empresa = agenteRepository.save(empresa);

            // 2. Banco / Agente Financeiro Padrão
            Agente banco = new Agente();
            banco.setNome("Banco Itaú Crédito Auto");
            banco.setEmail("banco@rentcars.com");
            banco.setSenha(senhaPadrao);
            banco.setRole("ROLE_BANCO");
            banco.setEndereco("Av. Faria Lima, 3500 - São Paulo, SP");
            banco.setCnpj("98765432000111");
            agenteRepository.save(banco);

            // 3. Cliente Padrão
            Cliente cliente = new Cliente();
            cliente.setNome("Gabriel Silva");
            cliente.setEmail("cliente@rentcars.com");
            cliente.setSenha(senhaPadrao);
            cliente.setRole("ROLE_CLIENTE");
            cliente.setEndereco("Rua da Bahia, 1000 - Belo Horizonte, MG");
            cliente.setCpf("11122233344");
            cliente.setRg("MG12345678");
            cliente.setProfissao("Engenheiro de Software");

            List<Rendimento> rendimentos = new ArrayList<>();
            Rendimento r1 = new Rendimento();
            r1.setEmpregadora("Tech Solutions SA");
            r1.setValor(new BigDecimal("12000.00"));
            rendimentos.add(r1);

            Rendimento r2 = new Rendimento();
            r2.setEmpregadora("PUC Minas - Projetos");
            r2.setValor(new BigDecimal("4500.00"));
            rendimentos.add(r2);

            cliente.setRendimentos(rendimentos);
            clienteRepository.save(cliente);

            // 4. Cadastra veículos de demonstração vinculados à empresa
            Automovel carro1 = new Automovel();
            carro1.setMarca("Porsche");
            carro1.setModelo("911 Carrera S");
            carro1.setAno(2024);
            carro1.setMatricula("POR-911-2024");
            carro1.setPlaca("PCH9E11");
            carro1.setPrecoPorDia(new BigDecimal("950.00"));
            carro1.setImageUrl("https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200");
            carro1.setProprietario(empresa);
            automovelRepository.save(carro1);

            Automovel carro2 = new Automovel();
            carro2.setMarca("BMW");
            carro2.setModelo("M4 Competition");
            carro2.setAno(2024);
            carro2.setMatricula("BMW-M4-2024");
            carro2.setPlaca("BMW4M00");
            carro2.setPrecoPorDia(new BigDecimal("780.00"));
            carro2.setImageUrl("https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200");
            carro2.setProprietario(empresa);
            automovelRepository.save(carro2);

            System.out.println("✅ Usuários iniciais (empresa@rentcars.com, banco@rentcars.com, cliente@rentcars.com) e frota criados com sucesso!");
        }
    }
}
