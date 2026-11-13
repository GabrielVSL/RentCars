package com.aluguel.facades;

import com.aluguel.models.Automovel;
import com.aluguel.models.Usuario;
import com.aluguel.repositories.AutomovelRepository;
import com.aluguel.repositories.UsuarioRepository;
import jakarta.inject.Singleton;
import java.util.List;

@Singleton
public class AutomovelFacade {

    private final AutomovelRepository automovelRepository;
    private final UsuarioRepository usuarioRepository;

    public AutomovelFacade(AutomovelRepository automovelRepository, UsuarioRepository usuarioRepository) {
        this.automovelRepository = automovelRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Automovel> listarTodos() {
        return java.util.stream.StreamSupport.stream(automovelRepository.findAll().spliterator(), false)
                .toList();
    }

    public Automovel buscarPorId(Long id) {
        return automovelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Automóvel não encontrado."));
    }

    public List<Automovel> listarPorProprietario(String emailProprietario) {
        Usuario usuario = usuarioRepository.findByEmail(emailProprietario).orElse(null);
        if (usuario != null && "ROLE_ADMIN".equals(usuario.getRole())) {
            return listarTodos();
        }
        return automovelRepository.findByProprietarioEmail(emailProprietario);
    }

    public Automovel criar(Automovel automovel, String emailProprietario) {
        Usuario proprietario = usuarioRepository.findByEmail(emailProprietario)
                .orElseThrow(() -> new IllegalArgumentException("Proprietário não encontrado"));

        automovel.setProprietario(proprietario);
        return automovelRepository.save(automovel);
    }

    public Automovel atualizar(Long id, Automovel dadosNovos, String emailLogado) {
        Automovel carro = automovelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Carro não encontrado"));

        boolean isAdmin = usuarioRepository.findByEmail(emailLogado)
                .map(u -> "ROLE_ADMIN".equals(u.getRole()))
                .orElse(false);

        if (!isAdmin && !carro.getProprietario().getEmail().equals(emailLogado)) {
            throw new IllegalArgumentException("Você não tem permissão para editar este veículo.");
        }

        carro.setMarca(dadosNovos.getMarca());
        carro.setModelo(dadosNovos.getModelo());
        carro.setAno(dadosNovos.getAno());
        carro.setPlaca(dadosNovos.getPlaca());
        carro.setMatricula(dadosNovos.getMatricula());
        carro.setImageUrl(dadosNovos.getImageUrl());
        carro.setPrecoPorDia(dadosNovos.getPrecoPorDia());
        if (dadosNovos.getPotenciaCv() != null) carro.setPotenciaCv(dadosNovos.getPotenciaCv());
        if (dadosNovos.getAceleracao0a100() != null) carro.setAceleracao0a100(dadosNovos.getAceleracao0a100());
        if (dadosNovos.getVelocidadeMaxima() != null) carro.setVelocidadeMaxima(dadosNovos.getVelocidadeMaxima());
        if (dadosNovos.getCategoria() != null) carro.setCategoria(dadosNovos.getCategoria());

        return automovelRepository.update(carro);
    }

    public void deletar(Long id, String emailLogado) {
        Automovel carro = automovelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Carro não encontrado"));

        boolean isAdmin = usuarioRepository.findByEmail(emailLogado)
                .map(u -> "ROLE_ADMIN".equals(u.getRole()))
                .orElse(false);

        if (!isAdmin && !carro.getProprietario().getEmail().equals(emailLogado)) {
            throw new IllegalArgumentException("Você não tem permissão para excluir este veículo.");
        }

        automovelRepository.delete(carro);
    }
}
