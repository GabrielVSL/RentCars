package com.aluguel.security;

import com.aluguel.models.*;
import com.aluguel.repositories.*;
import com.aluguel.utils.CnhValidator;
import io.micronaut.context.event.StartupEvent;
import io.micronaut.runtime.event.annotation.EventListener;
import jakarta.inject.Singleton;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Singleton
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final AgenteRepository agenteRepository;
    private final ClienteRepository clienteRepository;
    private final AutomovelRepository automovelRepository;
    private final CircuitoRepository circuitoRepository;
    private final TrackSlotRepository trackSlotRepository;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           AgenteRepository agenteRepository,
                           ClienteRepository clienteRepository,
                           AutomovelRepository automovelRepository,
                           CircuitoRepository circuitoRepository,
                           TrackSlotRepository trackSlotRepository) {
        this.usuarioRepository = usuarioRepository;
        this.agenteRepository = agenteRepository;
        this.clienteRepository = clienteRepository;
        this.automovelRepository = automovelRepository;
        this.circuitoRepository = circuitoRepository;
        this.trackSlotRepository = trackSlotRepository;
    }

    @EventListener
    public void onStartup(StartupEvent event) {
        // 1. Inicializa os 8 circuitos internacionais de alta velocidade se ainda não existirem
        Map<String, Circuito> circuitosMap = new HashMap<>();
        if (circuitoRepository.count() == 0) {
            Circuito nurburgring = circuitoRepository.save(new Circuito(
                    "nurburgring", "Nürburgring Nordschleife", "Alemanha", "Europa",
                    new BigDecimal("20.832"), 73, "6:35.183", 45
            ));
            Circuito spa = circuitoRepository.save(new Circuito(
                    "spa", "Circuit de Spa-Francorchamps", "Bélgica", "Europa",
                    new BigDecimal("7.004"), 19, "1:41.252", 40
            ));
            Circuito monza = circuitoRepository.save(new Circuito(
                    "monza", "Autodromo Nazionale Monza", "Itália", "Europa",
                    new BigDecimal("5.793"), 11, "1:18.887", 35
            ));
            Circuito monaco = circuitoRepository.save(new Circuito(
                    "monaco", "Circuit de Monaco", "Mônaco", "Europa",
                    new BigDecimal("3.337"), 19, "1:10.166", 25
            ));
            Circuito leMans = circuitoRepository.save(new Circuito(
                    "le_mans", "Circuit de la Sarthe (Le Mans)", "França", "Europa",
                    new BigDecimal("13.626"), 38, "3:14.791", 62
            ));
            Circuito silverstone = circuitoRepository.save(new Circuito(
                    "silverstone", "Silverstone Circuit", "Reino Unido", "Europa",
                    new BigDecimal("5.891"), 18, "1:24.303", 40
            ));
            Circuito interlagos = circuitoRepository.save(new Circuito(
                    "interlagos", "Autódromo de Interlagos", "Brasil", "América do Sul",
                    new BigDecimal("4.309"), 15, "1:07.281", 30
            ));
            Circuito suzuka = circuitoRepository.save(new Circuito(
                    "suzuka", "Suzuka International Racing Course", "Japão", "Ásia",
                    new BigDecimal("5.807"), 18, "1:27.064", 35
            ));

            circuitosMap.put("nurburgring", nurburgring);
            circuitosMap.put("spa", spa);
            circuitosMap.put("monza", monza);
            circuitosMap.put("monaco", monaco);
            circuitosMap.put("le_mans", leMans);
            circuitosMap.put("silverstone", silverstone);
            circuitosMap.put("interlagos", interlagos);
            circuitosMap.put("suzuka", suzuka);

            // Popula os TrackSlots (sessões agendáveis) para os próximos 14 dias
            LocalDate hoje = LocalDate.now();
            for (Circuito c : circuitosMap.values()) {
                for (int d = 1; d <= 14; d++) {
                    LocalDate dataSlot = hoje.plusDays(d);

                    TrackSlot slotManha = new TrackSlot(c, dataSlot, "MANHA", 12);
                    slotManha.setVagasOcupadas(d % 3 == 0 ? 4 : 1);
                    slotManha.setTaxaAdicionalTurno(BigDecimal.ZERO);
                    trackSlotRepository.save(slotManha);

                    TrackSlot slotTarde = new TrackSlot(c, dataSlot, "TARDE", 12);
                    slotTarde.setVagasOcupadas(d % 2 == 0 ? 5 : 2);
                    slotTarde.setTaxaAdicionalTurno(new BigDecimal("250.00"));
                    trackSlotRepository.save(slotTarde);

                    TrackSlot slotNoite = new TrackSlot(c, dataSlot, "NOTURNO", 8);
                    slotNoite.setVagasOcupadas(d % 4 == 0 ? 3 : 0);
                    slotNoite.setTaxaAdicionalTurno(new BigDecimal("500.00"));
                    trackSlotRepository.save(slotNoite);
                }
            }
        } else {
            circuitoRepository.findAll().forEach(c -> circuitosMap.put(c.getId(), c));
        }

        // 2. Inicializa os Usuários (Administrador, VIP Black, Inadimplente, Cliente Regular)
        if (usuarioRepository.count() == 0) {
            String senhaPadrao = BCrypt.hashpw("123456", BCrypt.gensalt());

            // 2.1 Empresa / Direção de Prova
            Agente empresa = new Agente();
            empresa.setNome("Apex Pitlane Management");
            empresa.setEmail("empresa@rentcars.com");
            empresa.setSenha(senhaPadrao);
            empresa.setRole("ROLE_EMPRESA");
            empresa.setEndereco("Av. Interlagos, 1000 - Box 01 - São Paulo, SP");
            empresa.setCnpj("12345678000199");
            empresa = agenteRepository.save(empresa);

            // 2.2 Administrador Executivo (Apex Race Director)
            Agente admin = new Agente();
            admin.setNome("Apex Race Director");
            admin.setEmail("admin@apex.com");
            admin.setSenha(senhaPadrao);
            admin.setRole("ROLE_ADMIN");
            admin.setEndereco("Apex HQ - Race Control Center");
            admin.setCnpj("99887766000122");
            agenteRepository.save(admin);

            // 2.3 Banco / Agente Financeiro ApexPay
            Agente banco = new Agente();
            banco.setNome("ApexPay Financial & Risk");
            banco.setEmail("banco@rentcars.com");
            banco.setSenha(senhaPadrao);
            banco.setRole("ROLE_BANCO");
            banco.setEndereco("Av. Faria Lima, 3500 - São Paulo, SP");
            banco.setCnpj("98765432000111");
            agenteRepository.save(banco);

            // 2.4 Cliente VIP Apex Black (R$ 60.000 depositados, 15% de desconto automático)
            Cliente clienteVip = new Cliente();
            clienteVip.setNome("Felipe Massa (VIP Apex)");
            clienteVip.setEmail("vip@apex.com");
            clienteVip.setSenha(senhaPadrao);
            clienteVip.setRole("ROLE_CLIENTE");
            clienteVip.setEndereco("Monaco Marina View, Apt 12B");
            clienteVip.setCpf("99988877766");
            clienteVip.setRg("SP99887766");
            clienteVip.setProfissao("Piloto Profissional FIA");
            clienteVip.setCnhNumero(CnhValidator.CNH_TESTE_OFICIAL);
            clienteVip.setCnhCategoria("AB");
            clienteVip.setDataNascimento(LocalDate.of(1985, 4, 25));
            clienteVip.setSaldoCarteira(new BigDecimal("60000.00"));
            clienteVip.setTotalDepositadoHistorico(new BigDecimal("60000.00"));
            clienteVip.setStatusFinanceiro("REGULAR");
            clienteRepository.save(clienteVip);

            // 2.5 Cliente Inadimplente (Saldo negativo de R$ -2.500,00 - Bloqueado pelo ApexPay)
            Cliente clienteDevedor = new Cliente();
            clienteDevedor.setNome("Carlos Piloto Devedor");
            clienteDevedor.setEmail("devedor@apex.com");
            clienteDevedor.setSenha(senhaPadrao);
            clienteDevedor.setRole("ROLE_CLIENTE");
            clienteDevedor.setEndereco("Rua das Dívidas, 100 - Curitiba, PR");
            clienteDevedor.setCpf("55544433322");
            clienteDevedor.setRg("PR55443322");
            clienteDevedor.setProfissao("Piloto Amador");
            clienteDevedor.setCnhNumero(CnhValidator.CNH_TESTE_OFICIAL);
            clienteDevedor.setCnhCategoria("B");
            clienteDevedor.setDataNascimento(LocalDate.of(1992, 8, 10));
            clienteDevedor.setSaldoCarteira(new BigDecimal("-2500.00"));
            clienteDevedor.setTotalDepositadoHistorico(new BigDecimal("3000.00"));
            clienteDevedor.setStatusFinanceiro("INADIMPLENTE");
            clienteRepository.save(clienteDevedor);

            // 2.6 Cliente Padrão / Recrutador (Gabriel Silva - Tier Silver com R$ 15.000 saldo)
            Cliente cliente = new Cliente();
            cliente.setNome("Gabriel Silva");
            cliente.setEmail("cliente@rentcars.com");
            cliente.setSenha(senhaPadrao);
            cliente.setRole("ROLE_CLIENTE");
            cliente.setEndereco("Rua da Bahia, 1000 - Belo Horizonte, MG");
            cliente.setCpf("11122233344");
            cliente.setRg("MG12345678");
            cliente.setProfissao("Engenheiro de Software");
            cliente.setCnhNumero(CnhValidator.CNH_TESTE_OFICIAL);
            cliente.setCnhCategoria("B");
            cliente.setDataNascimento(LocalDate.of(1998, 5, 12));
            cliente.setSaldoCarteira(new BigDecimal("15000.00"));
            cliente.setTotalDepositadoHistorico(new BigDecimal("15000.00"));
            cliente.setStatusFinanceiro("REGULAR");

            List<Rendimento> rendimentos = new ArrayList<>();
            Rendimento r1 = new Rendimento();
            r1.setEmpregadora("Tech Solutions SA");
            r1.setValor(new BigDecimal("12000.00"));
            rendimentos.add(r1);
            cliente.setRendimentos(rendimentos);
            clienteRepository.save(cliente);

            // 3. Cadastra os 8 Supercarros alocados nos boxes dos 8 autódromos (2 por montadora)
            registrarAutomovel("Porsche", "911 GT3 RS (992)", 2024, "POR-GT3RS-2024", "GT39E92",
                    "3850.00", "/cars/porsche-studio.webp", 525, "3.2s", "296 km/h", "GT3",
                    circuitosMap.get("nurburgring"), empresa);

            registrarAutomovel("BMW", "M4 Competition Track", 2024, "BMW-M4C-2024", "M4C8E20",
                    "2750.00", "/cars/bmw-studio.webp", 510, "3.5s", "290 km/h", "GT4",
                    circuitosMap.get("spa"), empresa);

            registrarAutomovel("Mercedes-AMG", "GT Track Series", 2024, "AMG-GTR-2024", "AMG9E00",
                    "3950.00", "/cars/amg-studio.webp", 734, "2.8s", "315 km/h", "GT2",
                    circuitosMap.get("monza"), empresa);

            registrarAutomovel("Audi", "R8 V10 Performance", 2024, "AUD-R8V10-2024", "R8V1E00",
                    "3400.00", "/cars/audi-studio.webp", 620, "3.1s", "331 km/h", "GT3",
                    circuitosMap.get("interlagos"), empresa);

            registrarAutomovel("Porsche", "718 Cayman GT4 RS", 2024, "POR-GT4RS-2024", "GT48E71",
                    "3100.00", "/cars/cayman-studio.webp", 500, "3.4s", "315 km/h", "GT4",
                    circuitosMap.get("monaco"), empresa);

            registrarAutomovel("BMW", "M8 Competition Coupé", 2024, "BMW-M8C-2024", "M8C9E92",
                    "3250.00", "/cars/m8-studio.webp", 625, "3.2s", "305 km/h", "GT3",
                    circuitosMap.get("le_mans"), empresa);

            registrarAutomovel("Mercedes-AMG", "GT Black Series", 2024, "AMG-GTBS-2024", "AMGBS24",
                    "4450.00", "/cars/amg-bs-studio.webp", 730, "3.2s", "325 km/h", "GT2",
                    circuitosMap.get("silverstone"), empresa);

            registrarAutomovel("Audi", "RS e-tron GT Performance", 2025, "AUD-ETRON-2025", "ETR9E25",
                    "3600.00", "/cars/etrongt-studio.webp", 925, "2.5s", "250 km/h", "ELECTRIC",
                    circuitosMap.get("suzuka"), empresa);

            log.info("Apex Track Experience: 8 autódromos, TrackSlots de 14 dias, frota de 8 supercarros e perfis de teste inicializados.");
        }
    }

    private void registrarAutomovel(String marca, String modelo, int ano, String matricula, String placa,
                                    String precoPorDia, String imageUrl, int potenciaCv, String aceleracao0a100,
                                    String velocidadeMaxima, String categoria, Circuito circuito, Agente proprietario) {
        Automovel carro = new Automovel();
        carro.setMarca(marca);
        carro.setModelo(modelo);
        carro.setAno(ano);
        carro.setMatricula(matricula);
        carro.setPlaca(placa);
        carro.setPrecoPorDia(new BigDecimal(precoPorDia));
        carro.setImageUrl(imageUrl);
        carro.setPotenciaCv(potenciaCv);
        carro.setAceleracao0a100(aceleracao0a100);
        carro.setVelocidadeMaxima(velocidadeMaxima);
        carro.setCategoria(categoria);
        carro.setCircuito(circuito);
        carro.setAtivoBox(true);
        carro.setProprietario(proprietario);
        automovelRepository.save(carro);
    }
}
