package com.aluguel.facades;

import com.aluguel.models.*;
import com.aluguel.repositories.*;
import com.aluguel.utils.CnhValidator;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
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
    private final ApexPayFacade apexPayFacade;

    @Inject
    public PedidoFacade(PedidoRepository pedidoRepository,
                        AutomovelRepository automovelRepository,
                        UsuarioRepository usuarioRepository,
                        TrackSlotRepository trackSlotRepository,
                        ApexPayFacade apexPayFacade) {
        this.pedidoRepository = pedidoRepository;
        this.automovelRepository = automovelRepository;
        this.usuarioRepository = usuarioRepository;
        this.trackSlotRepository = trackSlotRepository;
        this.apexPayFacade = apexPayFacade;
    }

    public PedidoFacade(PedidoRepository pedidoRepository,
                        AutomovelRepository automovelRepository,
                        UsuarioRepository usuarioRepository,
                        TrackSlotRepository trackSlotRepository) {
        this(pedidoRepository, automovelRepository, usuarioRepository, trackSlotRepository, null);
    }

    public PedidoFacade(PedidoRepository pedidoRepository,
                        AutomovelRepository automovelRepository,
                        UsuarioRepository usuarioRepository) {
        this(pedidoRepository, automovelRepository, usuarioRepository, null, null);
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
        String servico = pedido.getTipoServico() != null ? pedido.getTipoServico() : "TRACK_EXPERIENCE";
        boolean isVisitaBox = "VISITA_BOX".equalsIgnoreCase(servico);

        Automovel automovel = null;
        if (!isVisitaBox) {
            if (pedido.getAutomovel() == null || pedido.getAutomovel().getId() == null) {
                throw new IllegalArgumentException("Automóvel inválido.");
            }
            automovel = automovelRepository.findById(pedido.getAutomovel().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Automóvel não encontrado."));
        } else if (pedido.getAutomovel() != null && pedido.getAutomovel().getId() != null) {
            automovel = automovelRepository.findById(pedido.getAutomovel().getId()).orElse(null);
        }

        // 1. Validação de Datas
        if (pedido.getDataFim() == null || pedido.getDataInicio() == null) {
            throw new IllegalArgumentException("Datas de início e fim são obrigatórias.");
        }
        if (!pedido.getDataFim().isAfter(pedido.getDataInicio())) {
            throw new IllegalArgumentException("A data de devolução não pode ser anterior ou igual à data de retirada.");
        }
        if (pedido.getDataInicio().toLocalDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("O aluguel não pode iniciar no passado.");
        }
        if (pedido.getDataInicio().getDayOfWeek() == DayOfWeek.MONDAY) {
            throw new IllegalArgumentException("As pistas permanecem fechadas às segundas-feiras para manutenção FIA e calibração de telemetria. Escolha outra data.");
        }

        // 2. Verificação de Overbooking e Conflitos de Veículo
        if (automovel != null) {
            long conflitos = pedidoRepository.countAlugueisConflitantes(
                automovel.getId(),
                pedido.getDataInicio(),
                pedido.getDataFim()
            );

            if (conflitos > 0) {
                throw new IllegalArgumentException("Este veículo já está reservado para o período selecionado. Por favor, escolha outras datas ou outro veículo.");
            }
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

        // Atualiza dados de habilitação enviados no checkout se informados
        boolean perfilAtualizado = false;
        if (pedido.getCnhInformada() != null && !pedido.getCnhInformada().isBlank()) {
            String cnhLimpa = pedido.getCnhInformada().replaceAll("\\D", "");
            if (!CnhValidator.isValid(cnhLimpa)) {
                throw new IllegalArgumentException("CNH informada inválida no algoritmo oficial (Módulo 11). Para testes utilize: " + CnhValidator.CNH_TESTE_OFICIAL);
            }
            cliente.setCnhNumero(cnhLimpa);
            perfilAtualizado = true;
        }
        if (pedido.getDataNascimentoInformada() != null && !pedido.getDataNascimentoInformada().isBlank()) {
            cliente.setDataNascimento(LocalDate.parse(pedido.getDataNascimentoInformada()));
            perfilAtualizado = true;
        }
        if (perfilAtualizado) {
            usuarioRepository.update(cliente);
        }

        // 4. Validações de Elegibilidade de Pilotagem vs Visita/Carona
        boolean exigePilotagem = "TRACK_EXPERIENCE".equalsIgnoreCase(servico) || "PACOTE_VIP".equalsIgnoreCase(servico);

        if (exigePilotagem) {
            if (cliente.getDataNascimento() == null) {
                throw new IllegalArgumentException("Data de nascimento obrigatória para validação de idade mínima de pilotagem (Serviço: " + servico + ").");
            }
            long idade = ChronoUnit.YEARS.between(cliente.getDataNascimento(), LocalDate.now());
            if (idade < 21) {
                throw new IllegalArgumentException("Idade mínima de 21 anos exigida para pilotagem de supercarros em autódromos internacionais (Serviço: " + servico + ").");
            }

            String cnh = cliente.getCnhNumero();
            if (cnh == null || !CnhValidator.isValid(cnh)) {
                throw new IllegalArgumentException("CNH válida obrigatória para pilotagem em pista (Módulo 11). Informe sua CNH ou utilize a de teste oficial (" + CnhValidator.CNH_TESTE_OFICIAL + ").");
            }
        }

        // 5. Verificação e Reserva do TrackSlot (Vagas de Box no Autódromo)
        if (pedido.getTrackSlot() != null && pedido.getTrackSlot().getId() != null && trackSlotRepository != null) {
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

        // 6. Cálculo Seguro por Modalidade de Sessão + Taxa de Turno + Desconto Fidelidade ApexPay
        BigDecimal valorBase;
        if (isVisitaBox) {
            valorBase = new BigDecimal("890.00");
        } else {
            long dias = ChronoUnit.DAYS.between(pedido.getDataInicio().toLocalDate(), pedido.getDataFim().toLocalDate());
            if (dias <= 0) {
                dias = 1;
            }
            BigDecimal precoSessao = automovel.getPrecoPorDia() != null ? automovel.getPrecoPorDia() : BigDecimal.ZERO;
            BigDecimal multiplicadorServico = switch (servico.toUpperCase()) {
                case "FAST_LAP" -> new BigDecimal("0.55");
                case "PACOTE_VIP" -> new BigDecimal("1.70");
                default -> BigDecimal.ONE;
            };
            valorBase = precoSessao.multiply(BigDecimal.valueOf(dias)).multiply(multiplicadorServico).setScale(2, RoundingMode.HALF_UP);
        }

        if (pedido.getTrackSlot() != null && pedido.getTrackSlot().getTaxaAdicionalTurno() != null) {
            valorBase = valorBase.add(pedido.getTrackSlot().getTaxaAdicionalTurno());
        }

        BigDecimal fatorDesconto = cliente.getFatorDesconto();
        BigDecimal desconto = valorBase.multiply(fatorDesconto).setScale(2, RoundingMode.HALF_UP);
        BigDecimal valorFinal = valorBase.subtract(desconto);

        pedido.setValorTotal(valorBase);
        pedido.setDescontoFidelidade(desconto);
        pedido.setValorFinal(valorFinal);

        if (pedido.getTrackingCode() == null || pedido.getTrackingCode().isBlank()) {
            pedido.setTrackingCode("APX-" + System.currentTimeMillis());
        }

        // 7. Processamento Financeiro ApexPay (se solicitado no checkout)
        String formaPgto = pedido.getFormaPagamento();
        if (apexPayFacade != null && formaPgto != null) {
            BigDecimal saldoAtual = cliente.getSaldoCarteira() != null ? cliente.getSaldoCarteira() : BigDecimal.ZERO;
            if ("CARTEIRA_APEXPAY".equalsIgnoreCase(formaPgto)) {
                if (saldoAtual.compareTo(valorFinal) < 0) {
                    throw new IllegalArgumentException(String.format(
                            "Saldo insuficiente na carteira ApexPay (Saldo: R$ %s | Sessão: R$ %s). Faça um depósito no ApexPay ou escolha Fatura Pós-Paga.",
                            saldoAtual, valorFinal
                    ));
                }
                apexPayFacade.debitarValorLiquido(
                        cliente,
                        valorFinal,
                        pedido.getTrackingCode(),
                        String.format("Sessão %s [%s]", servico, pedido.getTrackingCode())
                );
                pedido.setPagamentoStatus("PAGO_CARTEIRA");
                pedido.setStatus("APROVADO");
            } else if ("FATURA_APEXPAY".equalsIgnoreCase(formaPgto)) {
                apexPayFacade.debitarValorLiquido(
                        cliente,
                        valorFinal,
                        pedido.getTrackingCode(),
                        String.format("Fatura Pós-Paga ApexPay %s [%s]", servico, pedido.getTrackingCode())
                );
                pedido.setPagamentoStatus(cliente.isInadimplente() ? "DEBITO_ABERTO" : "PAGO_CARTEIRA");
                pedido.setStatus("PENDENTE_EMPRESA");
            } else {
                pedido.setPagamentoStatus("PENDENTE");
                pedido.setStatus("PENDENTE_EMPRESA");
            }
        } else {
            pedido.setPagamentoStatus("PENDENTE");
            pedido.setStatus("PENDENTE_EMPRESA");
        }

        return pedidoRepository.save(pedido);
    }

    public Pedido avaliarPedido(Long idPedido, String emailAgente, String novoStatus) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado."));

        Usuario usuario = usuarioRepository.findByEmail(emailAgente)
                .orElseThrow(() -> new IllegalArgumentException("Agente não encontrado."));

        if (!(usuario instanceof Agente)) {
            throw new IllegalArgumentException("Apenas agentes ou administradores podem avaliar pedidos.");
        }

        if ("ROLE_EMPRESA".equals(usuario.getRole())) {
            if (pedido.getAutomovel() != null && !pedido.getAutomovel().getProprietario().getEmail().equals(emailAgente)) {
                throw new IllegalArgumentException("Você não tem permissão para avaliar pedidos deste veículo.");
            }
            if (!"PENDENTE_EMPRESA".equals(pedido.getStatus())) {
                throw new IllegalArgumentException("Este pedido não está aguardando avaliação da sua empresa.");
            }
            if ("APROVADO".equals(novoStatus)) {
                pedido.setStatus("PENDENTE_BANCO");
            } else {
                pedido.setStatus("REJEITADO");
                liberarSlotSePresente(pedido);
                estornarSeNecessario(pedido, "Sessão rejeitada pela empresa locadora");
            }
        } else if ("ROLE_BANCO".equals(usuario.getRole()) || "ROLE_ADMIN".equals(usuario.getRole())) {
            if ("ROLE_BANCO".equals(usuario.getRole()) && !"PENDENTE_BANCO".equals(pedido.getStatus())) {
                throw new IllegalArgumentException("Este pedido não está disponível para homologação bancária. Ele deve ser aprovado pela empresa antes.");
            }
            if (!"PENDENTE_BANCO".equals(pedido.getStatus()) && !"PENDENTE_EMPRESA".equals(pedido.getStatus())) {
                throw new IllegalArgumentException("Este pedido não está disponível para homologação.");
            }
            if ("APROVADO".equals(novoStatus)) {
                pedido.setStatus("APROVADO");
            } else {
                pedido.setStatus("REJEITADO");
                liberarSlotSePresente(pedido);
                estornarSeNecessario(pedido, "Sessão rejeitada na homologação de crédito");
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

        return java.util.stream.StreamSupport.stream(pedidoRepository.findAll().spliterator(), false)
                .toList();
    }

    public List<Pedido> listarPedidosDoCliente(String emailCliente) {
        return pedidoRepository.findByClienteEmail(emailCliente);
    }

    public Pedido modificarPedidoAgente(Long idPedido, String emailAgente, Pedido dadosModificados) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado."));

        Usuario usuario = usuarioRepository.findByEmail(emailAgente)
                .orElseThrow(() -> new IllegalArgumentException("Agente não encontrado."));

        if (!"ROLE_EMPRESA".equals(usuario.getRole()) && !"ROLE_ADMIN".equals(usuario.getRole())) {
            throw new IllegalArgumentException("Apenas a empresa locadora ou administração podem sugerir novas datas.");
        }

        if ("ROLE_EMPRESA".equals(usuario.getRole()) && pedido.getAutomovel() != null
                && !pedido.getAutomovel().getProprietario().getEmail().equals(emailAgente)) {
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

        if (pedido.getAutomovel() != null) {
            long conflitos = pedidoRepository.countAlugueisConflitantesExcluindoPedido(
                pedido.getAutomovel().getId(),
                pedido.getId(),
                dadosModificados.getDataInicio(),
                dadosModificados.getDataFim()
            );
            if (conflitos > 0) {
                throw new IllegalArgumentException("As novas datas conflitam com outra reserva deste automóvel.");
            }
        }

        pedido.setDataInicio(dadosModificados.getDataInicio());
        pedido.setDataFim(dadosModificados.getDataFim());
        pedido.setAgenteAvaliador((Agente) usuario);

        long dias = ChronoUnit.DAYS.between(pedido.getDataInicio().toLocalDate(), pedido.getDataFim().toLocalDate());
        if (dias <= 0) dias = 1;

        BigDecimal valorBase;
        String servico = pedido.getTipoServico() != null ? pedido.getTipoServico() : "TRACK_EXPERIENCE";
        boolean isVisitaBox = "VISITA_BOX".equalsIgnoreCase(servico);
        if (isVisitaBox) {
            valorBase = new BigDecimal("890.00");
        } else if (pedido.getAutomovel() != null) {
            BigDecimal precoDiaria = pedido.getAutomovel().getPrecoPorDia() != null ? pedido.getAutomovel().getPrecoPorDia() : BigDecimal.ZERO;
            BigDecimal multiplicadorServico = switch (servico.toUpperCase()) {
                case "FAST_LAP" -> new BigDecimal("0.55");
                case "PACOTE_VIP" -> new BigDecimal("1.70");
                default -> BigDecimal.ONE;
            };
            valorBase = precoDiaria.multiply(BigDecimal.valueOf(dias)).multiply(multiplicadorServico).setScale(2, RoundingMode.HALF_UP);
        } else {
            valorBase = pedido.getValorTotal() != null ? pedido.getValorTotal() : BigDecimal.ZERO;
        }

        if (pedido.getTrackSlot() != null && pedido.getTrackSlot().getTaxaAdicionalTurno() != null) {
            valorBase = valorBase.add(pedido.getTrackSlot().getTaxaAdicionalTurno());
        }

        BigDecimal fatorDesconto = (pedido.getCliente() != null) ? pedido.getCliente().getFatorDesconto() : BigDecimal.ZERO;
        BigDecimal desconto = valorBase.multiply(fatorDesconto).setScale(2, RoundingMode.HALF_UP);
        BigDecimal valorFinal = valorBase.subtract(desconto);

        pedido.setValorTotal(valorBase);
        pedido.setDescontoFidelidade(desconto);
        pedido.setValorFinal(valorFinal);

        pedido.setStatus("REVISAO_CLIENTE");

        return pedidoRepository.update(pedido);
    }

    public Pedido responderContrapropostaCliente(Long idPedido, String emailCliente, boolean aceito) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado."));

        if (!pedido.getCliente().getEmail().equals(emailCliente)) {
            throw new IllegalArgumentException("Este pedido não pertence a você.");
        }

        if (!"REVISAO_CLIENTE".equals(pedido.getStatus())) {
            throw new IllegalArgumentException("Este pedido não está aguardando sua revisão.");
        }

        if (aceito) {
            pedido.setStatus("PENDENTE_BANCO");
        } else {
            pedido.setStatus("CANCELADO");
            liberarSlotSePresente(pedido);
            estornarSeNecessario(pedido, "Contraproposta de data recusada pelo piloto");
        }
        return pedidoRepository.update(pedido);
    }

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
        liberarSlotSePresente(pedido);
        estornarSeNecessario(pedido, "Sessão cancelada a pedido do piloto");
        return pedidoRepository.update(pedido);
    }

    private void liberarSlotSePresente(Pedido pedido) {
        if (pedido.getTrackSlot() != null) {
            pedido.getTrackSlot().liberarVaga();
            if (trackSlotRepository != null) {
                trackSlotRepository.update(pedido.getTrackSlot());
            }
        }
    }

    private void estornarSeNecessario(Pedido pedido, String motivo) {
        if (apexPayFacade != null && pedido.getCliente() != null) {
            String pStatus = pedido.getPagamentoStatus();
            if ("PAGO_CARTEIRA".equalsIgnoreCase(pStatus) || "DEBITO_ABERTO".equalsIgnoreCase(pStatus)) {
                BigDecimal valor = pedido.getValorFinal() != null ? pedido.getValorFinal() : pedido.getValorTotal();
                if (valor != null && valor.compareTo(BigDecimal.ZERO) > 0) {
                    apexPayFacade.estornarReserva(pedido.getCliente(), valor, pedido.getTrackingCode(), motivo);
                    pedido.setPagamentoStatus("ESTORNADO");
                }
            }
        }
    }
}
