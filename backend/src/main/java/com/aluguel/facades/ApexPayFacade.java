package com.aluguel.facades;

import com.aluguel.models.TransacaoApexPay;
import com.aluguel.models.Usuario;
import com.aluguel.repositories.TransacaoApexPayRepository;
import com.aluguel.repositories.UsuarioRepository;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Singleton
public class ApexPayFacade {

    private final UsuarioRepository usuarioRepository;
    private final TransacaoApexPayRepository transacaoRepository;

    public ApexPayFacade(UsuarioRepository usuarioRepository,
                         TransacaoApexPayRepository transacaoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.transacaoRepository = transacaoRepository;
    }

    @Transactional
    public TransacaoApexPay depositar(String email, BigDecimal valor, String descricao) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor do depósito deve ser maior que zero.");
        }
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + email));

        usuario.creditarSaldo(valor);
        usuarioRepository.update(usuario);

        TransacaoApexPay transacao = new TransacaoApexPay(
                usuario,
                "DEPOSITO",
                valor,
                (descricao != null && !descricao.isBlank()) ? descricao : "Depósito em Conta ApexPay",
                null
        );
        return transacaoRepository.save(transacao);
    }

    @Transactional
    public TransacaoApexPay debitarReserva(String email, BigDecimal valorOriginal, String trackingCode, String descricao) {
        if (valorOriginal == null || valorOriginal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor da reserva inválido para débito.");
        }

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + email));

        // Regra de Ouro: Inadimplente não pode agendar nada novo até quitar
        if (usuario.isInadimplente()) {
            throw new IllegalStateException("Conta ApexPay inadimplente (" + usuario.getSaldoCarteira() + " BRL). Regularize o saldo pendente antes de realizar novos agendamentos.");
        }

        // Aplica o desconto de Fidelidade baseado no total depositado acumulado
        BigDecimal fatorDesconto = usuario.getFatorDesconto();
        BigDecimal desconto = valorOriginal.multiply(fatorDesconto).setScale(2, RoundingMode.HALF_UP);
        BigDecimal valorFinal = valorOriginal.subtract(desconto);

        // Debita da carteira
        usuario.debitarSaldo(valorFinal);
        usuarioRepository.update(usuario);

        String desc = (descricao != null && !descricao.isBlank())
                ? descricao
                : String.format("Débito Reserva [%s] com Desconto Fidelidade (%s%%)", trackingCode, fatorDesconto.multiply(new BigDecimal("100")).intValue());

        TransacaoApexPay transacao = new TransacaoApexPay(
                usuario,
                "DEBITO_RESERVA",
                valorFinal,
                desc,
                trackingCode
        );
        return transacaoRepository.save(transacao);
    }

    @Transactional
    public TransacaoApexPay aplicarJurosInadimplencia(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + email));

        if (usuario.getSaldoCarteira() == null || usuario.getSaldoCarteira().compareTo(BigDecimal.ZERO) >= 0) {
            throw new IllegalStateException("Usuário não possui débitos vencidos. Saldo atual: " + usuario.getSaldoCarteira());
        }

        // Juros diários de 0.1% ao dia sobre o saldo devedor absoluto
        BigDecimal saldoDevedor = usuario.getSaldoCarteira().abs();
        BigDecimal valorJuros = saldoDevedor.multiply(new BigDecimal("0.001")).setScale(2, RoundingMode.HALF_UP);
        if (valorJuros.compareTo(new BigDecimal("0.01")) < 0) {
            valorJuros = new BigDecimal("0.01"); // Mínimo de 1 centavo
        }

        // Subtrai do saldo da carteira (aumenta o saldo negativo)
        usuario.setSaldoCarteira(usuario.getSaldoCarteira().subtract(valorJuros));
        usuario.setStatusFinanceiro("INADIMPLENTE");
        usuarioRepository.update(usuario);

        TransacaoApexPay transacao = new TransacaoApexPay(
                usuario,
                "JUROS_ATRASO",
                valorJuros,
                String.format("Aplicação de Juros Diários ApexPay (0.1%% sobre saldo devedor R$ %s)", saldoDevedor),
                null
        );
        return transacaoRepository.save(transacao);
    }

    public Map<String, Object> getResumoCarteira(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + email));

        Map<String, Object> resumo = new HashMap<>();
        resumo.put("usuarioId", usuario.getId());
        resumo.put("nome", usuario.getNome());
        resumo.put("email", usuario.getEmail());
        resumo.put("saldoCarteira", usuario.getSaldoCarteira() != null ? usuario.getSaldoCarteira() : BigDecimal.ZERO);
        resumo.put("totalDepositadoHistorico", usuario.getTotalDepositadoHistorico() != null ? usuario.getTotalDepositadoHistorico() : BigDecimal.ZERO);
        resumo.put("statusFinanceiro", usuario.getStatusFinanceiro() != null ? usuario.getStatusFinanceiro() : "REGULAR");
        resumo.put("inadimplente", usuario.isInadimplente());
        resumo.put("tierFidelidade", usuario.getTierFidelidade());
        resumo.put("porcentagemDesconto", usuario.getFatorDesconto().multiply(new BigDecimal("100")).intValue());
        return resumo;
    }

    public List<TransacaoApexPay> getExtrato(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + email));
        return transacaoRepository.findByUsuarioIdOrderByDataHoraDesc(usuario.getId());
    }
}
