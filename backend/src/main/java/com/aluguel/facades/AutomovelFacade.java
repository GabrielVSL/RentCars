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
        return (List<Automovel>) automovelRepository.findAll();
    }

    public Automovel criar(Automovel automovel, String emailProprietario) {
        // Busca a empresa logada no banco para vincular como dona do carro
        Usuario proprietario = usuarioRepository.findByEmail(emailProprietario)
                .orElseThrow(() -> new IllegalArgumentException("Proprietário não encontrado"));
        
        automovel.setProprietario(proprietario);
        return automovelRepository.save(automovel);
    }

    // --- MÉTODOS NOVOS QUE FALTAVAM ---

    public Automovel atualizar(Long id, Automovel dadosNovos, String emailLogado) {
        Automovel carro = automovelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Carro não encontrado"));

        // Segurança: Só o dono (Empresa logada) pode editar
        if (!carro.getProprietario().getEmail().equals(emailLogado)) {
            throw new IllegalStateException("Você não tem permissão para editar este veículo.");
        }

        carro.setMarca(dadosNovos.getMarca());
        carro.setModelo(dadosNovos.getModelo());
        carro.setAno(dadosNovos.getAno());
        carro.setPlaca(dadosNovos.getPlaca());
        carro.setMatricula(dadosNovos.getMatricula());
        carro.setImageUrl(dadosNovos.getImageUrl()); // Salva a URL do Cloudinary

        return automovelRepository.update(carro);
    }

    public void deletar(Long id, String emailLogado) {
        Automovel carro = automovelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Carro não encontrado"));

        // Segurança: Só o dono (Empresa logada) pode excluir
        if (!carro.getProprietario().getEmail().equals(emailLogado)) {
            throw new IllegalStateException("Você não tem permissão para excluir este veículo.");
        }

        automovelRepository.delete(carro);
    }
}