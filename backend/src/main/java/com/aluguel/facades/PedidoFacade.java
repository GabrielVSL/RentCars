package com.aluguel.facades;

import com.aluguel.models.*;
import com.aluguel.repositories.*;
import jakarta.inject.Singleton;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Singleton
public class PedidoFacade {

    private final PedidoRepository pedidoRepository;
    private final AutomovelRepository automovelRepository;
    private final UsuarioRepository usuarioRepository;

    public PedidoFacade(PedidoRepository pedidoRepository, AutomovelRepository automovelRepository, UsuarioRepository usuarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.automovelRepository = automovelRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Map<String, String>> buscarDatasOcupadas(Long automovelId) {
        List<String> statusAtivos = List.of("PENDENTE_EMPRESA", "PENDENTE_BANCO", "APROVADO", "REVISAO_CLIENTE");
        List<Pedido> pedidos = pedidoRepository.findByAutomovelIdAndStatusIn(automovelId, statusAtivos);
        
        return pedidos.stream().map(p -> Map.of(
            "from", p.getDataInicio().toString(),
            "to", p.getDataFim().toString()
        )).collect(Collectors.toList());
    }

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

        // 2. Verificação de Overbooking
        long conflitos = pedidoRepository.countAlugueisConflitantes(
            automovel.getId(), 
            pedido.getDataInicio(), 
            pedido.getDataFim()
        );

        if (conflitos > 0) {
            throw new IllegalArgumentException("Este veículo já está reservado para o período selecionado. Por favor, escolha outras datas ou outro veículo.");
        }

        // 3. Vincula o Cliente que está logado
        Usuario usuario = usuarioRepository.findByEmail(emailCliente)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado."));
        
        if (!(usuario instanceof Cliente)) {
            throw new IllegalArgumentException("Apenas clientes podem fazer pedidos de aluguel.");
        }

        pedido.setAutomovel(automovel);
        pedido.setCliente((Cliente) usuario);

        // 4. Cálculo do Valor Total no Backend (Regra de Negócio Segura)
        long dias = ChronoUnit.DAYS.between(pedido.getDataInicio().toLocalDate(), pedido.getDataFim().toLocalDate());
        if (dias <= 0) {
            dias = 1;
        }
        BigDecimal precoDiaria = automovel.getPrecoPorDia() != null ? automovel.getPrecoPorDia() : BigDecimal.ZERO;
        pedido.setValorTotal(precoDiaria.multiply(BigDecimal.valueOf(dias)));
        
        // Nasce na esteira da Empresa
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
        } else if ("ROLE_BANCO".equals(usuario.getRole())) {
            if (!"PENDENTE_BANCO".equals(pedido.getStatus())) {
                throw new IllegalArgumentException("Este pedido não está disponível para análise de crédito bancário.");
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
        
        // ROLE_BANCO vê todos os pedidos
        return (List<Pedido>) pedidoRepository.findAll();
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
