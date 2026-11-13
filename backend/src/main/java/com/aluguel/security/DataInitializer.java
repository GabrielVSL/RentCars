package com.aluguel.security;

import com.aluguel.models.*;
import com.aluguel.repositories.*;
import io.micronaut.context.event.StartupEvent;
import io.micronaut.runtime.event.annotation.EventListener;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Singleton
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final AgenteRepository agenteRepository;
    private final AutomovelRepository automovelRepository;
    private final CircuitoRepository circuitoRepository;
    private final TrackSlotRepository trackSlotRepository;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           AgenteRepository agenteRepository,
                           AutomovelRepository automovelRepository,
                           CircuitoRepository circuitoRepository,
                           TrackSlotRepository trackSlotRepository) {
        this.usuarioRepository = usuarioRepository;
        this.agenteRepository = agenteRepository;
        this.automovelRepository = automovelRepository;
        this.circuitoRepository = circuitoRepository;
        this.trackSlotRepository = trackSlotRepository;
    }

    @EventListener
    @Transactional
    public void onStartup(StartupEvent event) {
        // 1. Inicializa os 8 circuitos internacionais de alta velocidade se ainda não existirem
        Map<String, Circuito> circuitosMap = new HashMap<>();
        if (circuitoRepository.count() == 0) {
            circuitosMap.put("nurburgring", circuitoRepository.save(new Circuito(
                    "nurburgring", "Nürburgring Nordschleife", "Alemanha", "Europa",
                    new BigDecimal("20.832"), 73, "6:35.183", 45
            )));
            circuitosMap.put("spa", circuitoRepository.save(new Circuito(
                    "spa", "Circuit de Spa-Francorchamps", "Bélgica", "Europa",
                    new BigDecimal("7.004"), 19, "1:41.252", 40
            )));
            circuitosMap.put("monza", circuitoRepository.save(new Circuito(
                    "monza", "Autodromo Nazionale Monza", "Itália", "Europa",
                    new BigDecimal("5.793"), 11, "1:18.887", 35
            )));
            circuitosMap.put("monaco", circuitoRepository.save(new Circuito(
                    "monaco", "Circuit de Monaco", "Mônaco", "Europa",
                    new BigDecimal("3.337"), 19, "1:10.166", 25
            )));
            circuitosMap.put("le_mans", circuitoRepository.save(new Circuito(
                    "le_mans", "Circuit de la Sarthe (Le Mans)", "França", "Europa",
                    new BigDecimal("13.626"), 38, "3:14.791", 62
            )));
            circuitosMap.put("silverstone", circuitoRepository.save(new Circuito(
                    "silverstone", "Silverstone Circuit", "Reino Unido", "Europa",
                    new BigDecimal("5.891"), 18, "1:24.303", 40
            )));
            circuitosMap.put("interlagos", circuitoRepository.save(new Circuito(
                    "interlagos", "Autódromo de Interlagos", "Brasil", "América do Sul",
                    new BigDecimal("4.309"), 15, "1:07.281", 30
            )));
            circuitosMap.put("suzuka", circuitoRepository.save(new Circuito(
                    "suzuka", "Suzuka International Racing Course", "Japão", "Ásia",
                    new BigDecimal("5.807"), 18, "1:27.064", 35
            )));
        } else {
            circuitoRepository.findAll().forEach(c -> circuitosMap.put(c.getId(), c));
        }

        // Limpa slots residuais sem reservas em dias de manutenção (segunda-feira) ou noturnos de terça a quinta
        trackSlotRepository.findAll().forEach(slot -> {
            if (slot.getVagasOcupadas() != null && slot.getVagasOcupadas() == 0 && slot.getData() != null) {
                DayOfWeek dow = slot.getData().getDayOfWeek();
                boolean isSegunda = dow == DayOfWeek.MONDAY;
                boolean isNoturnoMeioSemana = "NOTURNO".equalsIgnoreCase(slot.getTurno())
                        && (dow == DayOfWeek.TUESDAY || dow == DayOfWeek.WEDNESDAY || dow == DayOfWeek.THURSDAY);
                if (isSegunda || isNoturnoMeioSemana) {
                    trackSlotRepository.delete(slot);
                }
            }
        });

        // Garante slots agendáveis para os próximos 14 dias respeitando o calendário operacional:
        // Seg: Fechado (Manutenção FIA) | Ter-Qui: Operação Reduzida (2 turnos) | Sex-Dom: Full Grid (3 turnos + Noturno)
        LocalDate hoje = LocalDate.now();
        for (Circuito c : circuitosMap.values()) {
            for (int d = 1; d <= 14; d++) {
                LocalDate dataSlot = hoje.plusDays(d);
                DayOfWeek dow = dataSlot.getDayOfWeek();
                if (dow == DayOfWeek.MONDAY) {
                    continue; // Manutenção de pista e calibração de cronometragem
                }
                boolean isFimDeSemana = (dow == DayOfWeek.FRIDAY || dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY);
                if (isFimDeSemana) {
                    criarSlotSeAusente(c, dataSlot, "MANHA", 12, d % 3 == 0 ? 4 : 2, BigDecimal.ZERO);
                    criarSlotSeAusente(c, dataSlot, "TARDE", 14, d % 2 == 0 ? 6 : 3, new BigDecimal("250.00"));
                    criarSlotSeAusente(c, dataSlot, "NOTURNO", 10, d % 4 == 0 ? 3 : 1, new BigDecimal("500.00"));
                } else {
                    // Terça a Quinta: menor procura -> menos vagas e sem sessão noturna
                    criarSlotSeAusente(c, dataSlot, "MANHA", 5, d % 2 == 0 ? 1 : 0, BigDecimal.ZERO);
                    criarSlotSeAusente(c, dataSlot, "TARDE", 6, d % 3 == 0 ? 2 : 1, new BigDecimal("250.00"));
                }
            }
        }

        // 2. Garante contas operacionais (Admin, Empresa e Banco) individualmente por e-mail
        Usuario owner = ensureAgenteConta(
                "admin@apex.com",
                "Apex Race Control (Admin)",
                "ROLE_ADMIN",
                "Apex HQ - Race Control Center",
                "99887766000122"
        );
        ensureAgenteConta(
                "empresa@rentcars.com",
                "Apex Pitlane Management",
                "ROLE_EMPRESA",
                "Av. Interlagos, 1000 - Box 01 - São Paulo, SP",
                "11222333000144"
        );
        ensureAgenteConta(
                "banco@rentcars.com",
                "Apex Credit & Risk Bank",
                "ROLE_BANCO",
                "Av. Faria Lima, 3500 - São Paulo, SP",
                "22333444000155"
        );

        // 3. Cadastra os 8 Supercarros únicos, alocando cada um em 3 pistas (= 3 carros distintos por pista)
        if (automovelRepository.count() == 0 && owner != null) {
            registrarAutomovel("Porsche", "911 GT3 RS (992)", 2024, "POR-GT3RS-2024", "GT39E92",
                    "3850.00", "/cars/porsche-studio.webp", 525, "3.2s", "296 km/h", "GT3",
                    List.of("nurburgring", "le_mans", "monaco"), circuitosMap, owner);

            registrarAutomovel("BMW", "M4 Competition Track", 2024, "BMW-M4C-2024", "M4C8E20",
                    "2750.00", "/cars/bmw-studio.webp", 510, "3.5s", "290 km/h", "GT4",
                    List.of("spa", "nurburgring", "silverstone"), circuitosMap, owner);

            registrarAutomovel("Mercedes-AMG", "GT Track Series", 2024, "AMG-GTR-2024", "AMG9E00",
                    "3950.00", "/cars/amg-studio.webp", 734, "2.8s", "315 km/h", "GT2",
                    List.of("monza", "nurburgring", "spa"), circuitosMap, owner);

            registrarAutomovel("Audi", "R8 V10 Performance", 2024, "AUD-R8V10-2024", "R8V1E00",
                    "3400.00", "/cars/audi-studio.webp", 620, "3.1s", "331 km/h", "GT3",
                    List.of("interlagos", "spa", "suzuka"), circuitosMap, owner);

            registrarAutomovel("Porsche", "718 Cayman GT4 RS", 2024, "POR-GT4RS-2024", "GT48E71",
                    "3100.00", "/cars/cayman-studio.webp", 500, "3.4s", "315 km/h", "GT4",
                    List.of("monaco", "silverstone", "interlagos"), circuitosMap, owner);

            registrarAutomovel("BMW", "M8 Competition Coupé", 2024, "BMW-M8C-2024", "M8C9E92",
                    "3250.00", "/cars/m8-studio.webp", 625, "3.2s", "305 km/h", "GT3",
                    List.of("le_mans", "monza", "interlagos"), circuitosMap, owner);

            registrarAutomovel("Mercedes-AMG", "GT Black Series", 2024, "AMG-GTBS-2024", "AMGBS24",
                    "4450.00", "/cars/amg-bs-studio.webp", 730, "3.2s", "325 km/h", "GT2",
                    List.of("silverstone", "le_mans", "suzuka"), circuitosMap, owner);

            registrarAutomovel("Audi", "RS e-tron GT Performance", 2025, "AUD-ETRON-2025", "ETR9E25",
                    "3600.00", "/cars/etrongt-studio.webp", 925, "2.5s", "250 km/h", "ELECTRIC",
                    List.of("suzuka", "monza", "monaco"), circuitosMap, owner);

            log.info("Frota unificada Apex inicializada: 8 supercarros com 3 autódromos cada (3 opções por pista).");
        } else {
            // Garante sincronização dos 3 circuitos caso os carros já existam de carga anterior
            sincronizarCircuitosExistentes(circuitosMap);
        }
    }

    private Usuario ensureAgenteConta(String email, String nome, String role, String endereco, String cnpj) {
        return usuarioRepository.findByEmail(email).orElseGet(() -> {
            Agente agente = new Agente();
            agente.setNome(nome);
            agente.setEmail(email);
            agente.setSenha(BCrypt.hashpw("123456", BCrypt.gensalt()));
            agente.setRole(role);
            agente.setEndereco(endereco);
            agente.setCnpj(cnpj);
            Usuario salvo = agenteRepository.save(agente);
            log.info("Conta operacional inicializada: {} ({}).", email, role);
            return salvo;
        });
    }

    private void criarSlotSeAusente(Circuito c, LocalDate data, String turno, int total, int ocupadas, BigDecimal taxa) {
        if (trackSlotRepository.findByCircuitoIdAndDataAndTurno(c.getId(), data, turno).isEmpty()) {
            TrackSlot slot = new TrackSlot(c, data, turno, total);
            slot.setVagasOcupadas(ocupadas);
            slot.setTaxaAdicionalTurno(taxa);
            trackSlotRepository.save(slot);
        }
    }

    private void registrarAutomovel(String marca, String modelo, int ano, String matricula, String placa,
                                    String precoPorDia, String imageUrl, int potenciaCv, String aceleracao0a100,
                                    String velocidadeMaxima, String categoria, List<String> circuitoIds,
                                    Map<String, Circuito> circuitosMap, Usuario proprietario) {
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
        for (String cid : circuitoIds) {
            carro.adicionarCircuito(circuitosMap.get(cid));
        }
        carro.setAtivoBox(true);
        carro.setProprietario(proprietario);
        automovelRepository.save(carro);
    }

    private void sincronizarCircuitosExistentes(Map<String, Circuito> circuitosMap) {
        Map<String, List<String>> alocacaoPorMatricula = Map.of(
                "POR-GT3RS-2024", List.of("nurburgring", "le_mans", "monaco"),
                "BMW-M4C-2024", List.of("spa", "nurburgring", "silverstone"),
                "AMG-GTR-2024", List.of("monza", "nurburgring", "spa"),
                "AUD-R8V10-2024", List.of("interlagos", "spa", "suzuka"),
                "POR-GT4RS-2024", List.of("monaco", "silverstone", "interlagos"),
                "BMW-M8C-2024", List.of("le_mans", "monza", "interlagos"),
                "AMG-GTBS-2024", List.of("silverstone", "le_mans", "suzuka"),
                "AUD-ETRON-2025", List.of("suzuka", "monza", "monaco")
        );
        automovelRepository.findAll().forEach(carro -> {
            List<String> ids = alocacaoPorMatricula.get(carro.getMatricula());
            if (ids != null && (carro.getCircuitosDisponiveis() == null || carro.getCircuitosDisponiveis().size() < 3)) {
                ids.forEach(cid -> carro.adicionarCircuito(circuitosMap.get(cid)));
                automovelRepository.update(carro);
            }
        });
    }
}
