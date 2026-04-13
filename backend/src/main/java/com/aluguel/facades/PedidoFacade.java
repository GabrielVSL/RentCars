package com.aluguel.facades;

import com.aluguel.models.*;
import com.aluguel.repositories.*;
import jakarta.inject.Singleton;
import java.time.LocalDateTime;

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

    public Pedido criarPedido(Pedido pedido, String emailCliente) {
        // 1. Validação de Datas (O que você pediu para ficarmos de olho)
        if (pedido.getDataFim().isBefore(pedido.getDataInicio())) {
            throw new IllegalArgumentException("A data de devolução não pode ser anterior à data de retirada.");
        }
        if (pedido.getDataInicio().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("O aluguel não pode iniciar no passado.");
        }

        // 2. Vincula o Cliente que está logado
        Usuario usuario = usuarioRepository.findByEmail(emailCliente)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));
        
        // Verifica se realmente é um Cliente (Cast seguro)
        if (!(usuario instanceof Cliente)) {
            throw new IllegalArgumentException("Apenas clientes podem fazer pedidos.");
        }
        
        pedido.setCliente((Cliente) usuario);
        pedido.setStatus("PENDENTE"); // PDF: Nasce como pendente
        
        return pedidoRepository.save(pedido);
    }

    public Pedido avaliarPedido(Long idPedido, String emailAgente, String novoStatus) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado"));

        Usuario usuario = usuarioRepository.findByEmail(emailAgente)
                .orElseThrow(() -> new IllegalArgumentException("Agente não encontrado"));

        // Regra do PDF: Apenas Agentes (Empresas/Bancos) podem avaliar
        if (!(usuario instanceof Agente)) {
            throw new IllegalArgumentException("Apenas agentes podem avaliar pedidos.");
        }

        pedido.setAgenteAvaliador((Agente) usuario);
        pedido.setStatus(novoStatus); // APROVADO ou REJEITADO
        
        return pedidoRepository.save(pedido);
    }
}