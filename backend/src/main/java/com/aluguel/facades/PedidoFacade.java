package com.aluguel.facades;

import com.aluguel.models.*;
import com.aluguel.repositories.*;
import com.aluguel.utils.CnhValidator;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Singleton
public class PedidoFacade {

    private final PedidoRepository pedidoRepository;
    private final AutomovelRepository automovelRepository;
    private final UsuarioRepository usuarioRepository;
    private final TrackSlotRepository trackSlotRepository;

    public PedidoFacade(PedidoRepository pedidoRepository,
                        AutomovelRepository automovelRepository,
                        UsuarioRepository usuarioRepository,
                        TrackSlotRepository trackSlotRepository) {
        this.pedidoRepository = pedidoRepository;
        this.automovelRepository = automovelRepository;
        this.usuarioRepository = usuarioRepository;
        this.trackSlotRepository = trackSlotRepository;
    }

    public PedidoFacade(PedidoRepository pedidoRepository,
                        AutomovelRepository automovelRepository,
                        UsuarioRepository usuarioRepository) {
        this(pedidoRepository, automovelRepository, usuarioRepository, null);
    }

    public List<Map<String, String>> buscarDatasOcupadas(Long automovelId) {
        List<String> statusAtivos = List.of("PENDENTE_EMPRESA", "PENDENTE_BANCO", "APROVADO", "REVISAO_CLIENTE");
        List<Pedido> pedidos = pedidoRepository.findByAutomovelIdAndStatusIn(automovelId, statusAtivos);
        
        return pedidos.stream().map(p -> Map.of(
            "from", p.getDataInicio().toString(),
            "to", p.getDataFim().toString()
        )).collect(Collectors.toList());
    }

    @Transactional
    public Pedido criarPedido(Pedido pedido, String emailCliente) {
        if (pedido.getAutomovel() == null || pedido.getAutomovel().getId() == null) {
            throw new IllegalArgumentException("Automóvel inválido.");
        }

        Automovel automovel = automovelRepository.findById(pedido.getAutomovel().getId())
                .orElseThrow(() -> new IllegalArgumentException("Automóvel não encontrado."));

        // 1. Validação de Datas
        if (pedido.getDataFim() == null || pedido.getDataInicio() == null) {
            throw new IllegalArgumentException("Datas de início e fim são obrigatórias.");
        }
        if (pedido.getDataFim().isBefore(pedido.getDataInicio())) {
            throw new IllegalArgumentException("A data de devolução não pode ser anterior à data de retirada.");
        }
        if (pedido.getDataInicio().toLocalDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("O aluguel não pode iniciar no passado.");
        }

        // 2. Verificação de Overbooking e Conflitos de Veículo
        long conflitos = pedidoRepository.countAlugueisConflitantes(
            automovel.getId(), 
            pedido.getDataInicio(), 
            pedido.getDataFim()
        );

        if (conflitos > 0) {
            throw new IllegalArgumentException("Este veículo já está reservado para o período selecionado. Por favor, escolha outras datas ou outro veículo.");
        }

        // 3. Vincula o Cliente logado e realiza checagem financeira de Inadimplência (ApexPay)
        Usuario usuario = usuarioRepository.findByEmail(emailCliente)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado."));
        
        if (!(usuario instanceof Cliente)) {
            throw new IllegalArgumentException("Apenas clientes podem fazer pedidos de aluguel ou agendamentos de pista.");
        }

        Cliente cliente = (Cliente) usuario;

        if (cliente.isInadimplente()) {
            throw new IllegalArgumentException("Conta com pendências financeiras no ApexPay (Saldo: R$ " + 
                    cliente.getSaldoCarteira() + "). Regularize os débitos pendentes para liberar novos agendamentos de autódromo.");
        }

        // 4. Validações de Elegibilidade de Pilotagem vs Visita/Carona
        String servico = pedido.getTipoServico() != null ? pedido.getTipoServico() : "TRACK_EXPERIENCE";
        boolean exigePilotagem = "TRACK_EXPERIENCE".equalsIgnoreCase(servico) || "PACOTE_VIP".equalsIgnoreCase(servico);

        if (exigePilotagem) {
            // 4.1 Checagem de Idade Mínima (21 anos para pilotar supercarros em autódromos)
            if (cliente.getDataNascimento() != null) {
                long idade = ChronoUnit.YEARS.between(cliente.getDataNascimento(), LocalDate.now());
                if (idade < 21) {
                    throw new IllegalArgumentException("Idade mínima de 21 anos exigida para pilotagem de supercarros em autódromos internacionais (Serviço: " + servico + ").");
                }
            }

            // 4.2 Validação algorítmica de CNH (Módulo 11 oficial)
            String cnh = cliente.getCnhNumero();
            if (cnh == null || !CnhValidator.isValid(cnh)) {
                throw new IllegalArgumentException("CNH válida obrigatória para pilotagem em pista (Módulo 11). Use o número de homologação oficial de teste (" + CnhValidator.CNH_TESTE_OFICIAL + ") ou cadastre uma CNH válida em seu perfil.");
            }
        }

        // 5. Verificação e Reserva do TrackSlot (Vagas de Box no Autódromo)
        if (pedido.getTrackSlot() != null && pedido.getTrackSlot().getId() != null) {
            TrackSlot slot = trackSlotRepository.findById(pedido.getTrackSlot().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Turno/Slot do autódromo não encontrado."));

            if (!slot.temVagaDisponivel()) {
                throw new IllegalArgumentException("Vagas de box esgotadas para o autódromo neste turno (" + slot.getTurno() + "). Escolha outro horário.");
            }
            slot.ocuparVaga();
            trackSlotRepository.update(slot);
            pedido.setTrackSlot(slot);
        }

        pedido.setAutomovel(automovel);
        pedido.setCliente(cliente);
        pedido.setTipoServico(servico);

        // 6. Cálculo Seguro de Diárias + Taxa de Turno + Desconto de Fidelidade ApexPay
        long dias = ChronoUnit.DAYS.between(pedido.getDataInicio().toLocalDate(), pedido.getDataFim().toLocalDate());
        if (dias <= 0) {
            dias = 1;
        }
        BigDecimal precoDiaria = automovel.getPrecoPorDia() != null ? automovel.getPrecoPorDia() : BigDecimal.ZERO;
        BigDecimal valorBase = precoDiaria.multiply(BigDecimal.valueOf(dias));

        // Adiciona taxa de turno se houver
        if (pedido.getTrackSlot() != null && pedido.getTrackSlot().getTaxaAdicionalTurno() != null) {
            valorBase = valorBase.add(pedido.getTrackSlot().getTaxaAdicionalTurno());
        }

        // Aplica desconto conforme o Tier de Fidelidade (Standard: 0%, Silver: 5%, Gold: 10%, Apex Black: 15%)
        BigDecimal fatorDesconto = cliente.getFatorDesconto();
        BigDecimal desconto = valorBase.multiply(fatorDesconto).setScale(2, RoundingMode.HALF_UP);
        BigDecimal valorFinal = valorBase.subtract(desconto);

        pedido.setValorTotal(valorBase);
        pedido.setDescontoFidelidade(desconto);
        pedido.setValorFinal(valorFinal);

        if (pedido.getTrackingCode() == null || pedido.getTrackingCode().isBlank()) {
            pedido.setTrackingCode("APX-" + System.currentTimeMillis());
        }

        // Nasce na esteira da Direção de Prova
        pedido.setStatus("PENDENTE_EMPRESA"); 
        
        return pedidoRepository.save(pedido);
    }

    public Pedido avaliarPedido(Long idPedido, String emailAgente, String novoStatus) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado."));

        Usuario usuario = usuarioRepository.findByEmail(emailAgente)
                .orElseThrow(() -> new IllegalArgumentException("Agente não encontrado."));

        if (!(usuario instanceof Agente)) {
            throw new IllegalArgumentException("Apenas agentes podem avaliar pedidos.");
        }

        if ("ROLE_EMPRESA".equals(usuario.getRole())) {
            if (!pedido.getAutomovel().getProprietario().getEmail().equals(emailAgente)) {
                throw new IllegalArgumentException("Você não tem permissão para avaliar pedidos deste veículo.");
            }
            if (!"PENDENTE_EMPRESA".equals(pedido.getStatus())) {
                throw new IllegalArgumentException("Este pedido não está aguardando avaliação da sua empresa.");
            }
            if ("APROVADO".equals(novoStatus)) {
                pedido.setStatus("PENDENTE_BANCO");
            } else {
                pedido.setStatus("REJEITADO");
            }
        } else if ("ROLE_BANCO".equals(usuario.getRole()) || "ROLE_ADMIN".equals(usuario.getRole())) {
            if (!"PENDENTE_BANCO".equals(pedido.getStatus()) && !"PENDENTE_EMPRESA".equals(pedido.getStatus())) {
                throw new IllegalArgumentException("Este pedido não está disponível para homologação financeira.");
            }
            if ("APROVADO".equals(novoStatus)) {
                pedido.setStatus("APROVADO");
            } else {
                pedido.setStatus("REJEITADO");
            }
        } else {
            throw new IllegalArgumentException("Perfil não autorizado para avaliar pedidos.");
        }

        pedido.setAgenteAvaliador((Agente) usuario);
        return pedidoRepository.update(pedido);
    }

    public List<Pedido> listarPedidosParaAgente(String emailAgente) {
        Usuario usuario = usuarioRepository.findByEmail(emailAgente)
                .orElseThrow(() -> new IllegalArgumentException("Agente não encontrado."));

        if ("ROLE_EMPRESA".equals(usuario.getRole())) {
            return pedidoRepository.findByAutomovelProprietarioEmail(emailAgente);
        }
        
        // ROLE_BANCO e ROLE_ADMIN veem todos os agendamentos da frota
        return java.util.stream.StreamSupport.stream(pedidoRepository.findAll().spliterator(), false)
                .toList();
    }

    public List<Pedido> listarPedidosDoCliente(String emailCliente) {
        return pedidoRepository.findByClienteEmail(emailCliente);
    }

    // A Empresa altera as datas e devolve para o cliente
    public Pedido modificarPedidoAgente(Long idPedido, String emailAgente, Pedido dadosModificados) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado."));

        Usuario usuario = usuarioRepository.findByEmail(emailAgente)
                .orElseThrow(() -> new IllegalArgumentException("Agente não encontrado."));

        if (!"ROLE_EMPRESA".equals(usuario.getRole())) {
            throw new IllegalArgumentException("Apenas a empresa locadora pode sugerir novas datas.");
        }

        if (!pedido.getAutomovel().getProprietario().getEmail().equals(emailAgente)) {
            throw new IllegalArgumentException("Você não tem permissão para modificar este pedido.");
        }

        if (!"PENDENTE_EMPRESA".equals(pedido.getStatus())) {
            throw new IllegalArgumentException("Apenas pedidos pendentes de avaliação da empresa podem receber contraproposta.");
        }

        if (dadosModificados.getDataFim().isBefore(dadosModificados.getDataInicio())) {
            throw new IllegalArgumentException("A data de devolução não pode ser anterior à data de retirada.");
        }
        if (dadosModificados.getDataInicio().toLocalDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("O período sugerido não pode iniciar no passado.");
        }

        // Checar conflito com outros pedidos (excluindo este próprio pedido)
        long conflitos = pedidoRepository.countAlugueisConflitantesExcluindoPedido(
            pedido.getAutomovel().getId(),
            pedido.getId(),
            dadosModificados.getDataInicio(),
            dadosModificados.getDataFim()
        );
        if (conflitos > 0) {
            throw new IllegalArgumentException("As novas datas conflitam com outra reserva deste automóvel.");
        }

        pedido.setDataInicio(dadosModificados.getDataInicio());
        pedido.setDataFim(dadosModificados.getDataFim());
        pedido.setAgenteAvaliador((Agente) usuario);

        // Recalcular valor total
        long dias = ChronoUnit.DAYS.between(pedido.getDataInicio().toLocalDate(), pedido.getDataFim().toLocalDate());
        if (dias <= 0) dias = 1;
        BigDecimal precoDiaria = pedido.getAutomovel().getPrecoPorDia() != null ? pedido.getAutomovel().getPrecoPorDia() : BigDecimal.ZERO;
        pedido.setValorTotal(precoDiaria.multiply(BigDecimal.valueOf(dias)));

        pedido.setStatus("REVISAO_CLIENTE"); 

        return pedidoRepository.update(pedido);
    }

    // O Cliente aceita ou recusa a nova proposta
    public Pedido responderContrapropostaCliente(Long idPedido, String emailCliente, boolean aceito) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado."));

        if (!pedido.getCliente().getEmail().equals(emailCliente)) {
            throw new IllegalArgumentException("Este pedido não pertence a você.");
        }

        if (!"REVISAO_CLIENTE".equals(pedido.getStatus())) {
            throw new IllegalArgumentException("Este pedido não está aguardando sua revisão.");
        }

        pedido.setStatus(aceito ? "PENDENTE_BANCO" : "CANCELADO");
        return pedidoRepository.update(pedido);
    }

    // Cancelamento do pedido ativo pelo próprio cliente
    public Pedido cancelarPedidoCliente(Long idPedido, String emailCliente) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado."));

        if (!pedido.getCliente().getEmail().equals(emailCliente)) {
            throw new IllegalArgumentException("Este pedido não pertence a você.");
        }

        if ("CANCELADO".equals(pedido.getStatus()) || "REJEITADO".equals(pedido.getStatus())) {
            throw new IllegalArgumentException("Este pedido já foi finalizado.");
        }

        pedido.setStatus("CANCELADO");
        return pedidoRepository.update(pedido);
    }
}
