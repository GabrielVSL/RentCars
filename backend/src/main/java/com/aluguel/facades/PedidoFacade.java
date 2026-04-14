package com.aluguel.facades;

import com.aluguel.models.*;
import com.aluguel.repositories.*;
import jakarta.inject.Singleton;
import java.time.LocalDateTime;
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
    List<String> statusAtivos = List.of("PENDENTE_EMPRESA", "PENDENTE_BANCO", "APROVADO");
    List<Pedido> pedidos = pedidoRepository.findByAutomovelIdAndStatusIn(automovelId, statusAtivos);
    
    return pedidos.stream().map(p -> Map.of(
        "from", p.getDataInicio().toString(),
        "to", p.getDataFim().toString()
    )).collect(Collectors.toList());
}

    public Pedido criarPedido(Pedido pedido, String emailCliente) {
        // 1. Validação de Datas Básicas
        if (pedido.getDataFim().isBefore(pedido.getDataInicio())) {
            throw new IllegalArgumentException("A data de devolução não pode ser anterior à data de retirada.");
        }
        if (pedido.getDataInicio().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("O aluguel não pode iniciar no passado.");
        }

        // 2. VERIFICAÇÃO DE OVERBOOKING (A Mágica acontece aqui!)
        // Checamos se já existe alguma reserva para esse carro nestas datas
        long conflitos = pedidoRepository.countAlugueisConflitantes(
            pedido.getAutomovel().getId(), 
            pedido.getDataInicio(), 
            pedido.getDataFim()
        );

        if (conflitos > 0) {
            throw new IllegalArgumentException("Este veículo já está reservado para o período selecionado. Por favor, escolha outras datas ou outro veículo.");
        }

        // 3. Vincula o Cliente que está logado
        Usuario usuario = usuarioRepository.findByEmail(emailCliente)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));
        
        if (!(usuario instanceof Cliente)) {
            throw new IllegalArgumentException("Apenas clientes podem fazer pedidos.");
        }
        
        pedido.setCliente((Cliente) usuario);
        
        // Nasce na esteira da Empresa (Regra atualizada)
        pedido.setStatus("PENDENTE_EMPRESA"); 
        
        return pedidoRepository.save(pedido);
    }

    public Pedido avaliarPedido(Long idPedido, String emailAgente, String novoStatus) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado"));

        Usuario usuario = usuarioRepository.findByEmail(emailAgente)
                .orElseThrow(() -> new IllegalArgumentException("Agente não encontrado"));

        if (!(usuario instanceof Agente)) {
            throw new IllegalArgumentException("Apenas agentes podem avaliar pedidos.");
        }

        // A MÁGICA DO PIPELINE ACONTECE AQUI:
        if (novoStatus.equals("APROVADO")) {
            if (usuario.getRole().equals("ROLE_EMPRESA")) {
                // A Localiza liberou o carro? Manda pro Banco avaliar o dinheiro.
                pedido.setStatus("PENDENTE_BANCO");
            } else if (usuario.getRole().equals("ROLE_BANCO")) {
                // O Banco aprovou o crédito? Agora sim, 100% aprovado!
                pedido.setStatus("APROVADO");
            }
        } else {
            // Se qualquer um dos dois clicar em REJEITADO, o pedido morre.
            pedido.setStatus(novoStatus); 
        }

        pedido.setAgenteAvaliador((Agente) usuario);
        return pedidoRepository.update(pedido);
    }

    public List<Pedido> listarPedidosParaAgente(String emailAgente) {
        Usuario usuario = usuarioRepository.findByEmail(emailAgente)
                .orElseThrow(() -> new IllegalArgumentException("Agente não encontrado"));

        // Se for uma EMPRESA, mostra apenas os pedidos dos carros dela
        if (usuario.getRole().equals("ROLE_EMPRESA")) {
            return pedidoRepository.findByAutomovelProprietarioEmail(emailAgente);
        }
        
        // Se for um BANCO, ele tem acesso a todos os pedidos para análise de crédito
        return (List<Pedido>) pedidoRepository.findAll();
    }

    public List<Pedido> listarPedidosDoCliente(String emailCliente) {
        return pedidoRepository.findByClienteEmail(emailCliente);
    }

    // 1. A Empresa altera as datas e devolve a bola para o cliente
    public Pedido modificarPedidoAgente(Long idPedido, String emailAgente, Pedido dadosModificados) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado"));

        Usuario usuario = usuarioRepository.findByEmail(emailAgente)
                .orElseThrow(() -> new IllegalArgumentException("Agente não encontrado"));

        if (!(usuario instanceof Agente)) {
            throw new IllegalArgumentException("Apenas agentes podem modificar pedidos.");
        }

        // Atualiza as datas com a contraproposta da empresa
        pedido.setDataInicio(dadosModificados.getDataInicio());
        pedido.setDataFim(dadosModificados.getDataFim());
        pedido.setAgenteAvaliador((Agente) usuario);
        
        // Novo Status: A bola agora está com o cliente!
        pedido.setStatus("REVISAO_CLIENTE"); 

        return pedidoRepository.update(pedido);
    }

    // 2. O Cliente aceita ou recusa a nova proposta
    public Pedido responderContrapropostaCliente(Long idPedido, String emailCliente, boolean aceito) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado"));

        if (!pedido.getCliente().getEmail().equals(emailCliente)) {
            throw new IllegalStateException("Este pedido não pertence a você.");
        }

        if (!pedido.getStatus().equals("REVISAO_CLIENTE")) {
            throw new IllegalStateException("Este pedido não está aguardando sua revisão.");
        }

        // CORREÇÃO: Se aceitou, manda pro Itaú (PENDENTE_BANCO). Se recusou, cancela.
        pedido.setStatus(aceito ? "PENDENTE_BANCO" : "CANCELADO");
        return pedidoRepository.update(pedido);
    }
    
    
}