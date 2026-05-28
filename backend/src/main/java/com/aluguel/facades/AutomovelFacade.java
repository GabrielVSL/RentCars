package com.aluguel.facades;

import com.aluguel.models.Automovel;
import com.aluguel.models.Usuario;
import com.aluguel.repositories.AutomovelRepository;
import com.aluguel.repositories.UsuarioRepository;
import jakarta.inject.Singleton;
import java.util.List;

@Singleton
public class AutomovelFacade {

    /*
     * ARCHITECTURE / EFFICIENCY NOTES (Service/Facade layer)
     *
     * Papel do Facade/Service:
     * - Contém regras de negócio, coordena transações e composições entre repositórios.
     * - Não deve expor entidades JPA diretamente para as camadas superiores.
     *
     * Recomendações arquiteturais:
     * 1) DTOs e Mappers: criar `AutomovelRequest`, `AutomovelUpdateRequest`, `AutomovelResponse`.
     *    - Use MapStruct para mapeamento eficiente e testável.
     * 2) Transações: anotar métodos mutantes com `@Transactional` no nível do Service.
     * 3) Autorização: extrair checagens (isOwner) para `AuthorizationService` ou usar AOP.
     * 4) Caching: aplicar cache (ex: Redis) em endpoints de leitura intensiva (`listarDisponiveis`, `listarTodos`)
     *    com invalidação quando houver escrita.
     * 5) Queries eficientes: para listagens usar projeções (interfaces DTO) e paginação;
     *    empurrar filtragem para a query SQL/JPA para reduzir transferência de dados.
     * 6) Concorrência: considerar `@Version` (optimistic locking) em entidades que são atualizadas frequentemente.
     * 7) Bulk ops e batched writes: usar `saveAll`/batching quando processar listas grandes.
     *
     * Benefícios de eficiência:
     * - Redução de I/O e memória por usar projeções + paginação.
     * - Menor latência para leituras frequentes com cache e queries otimizadas.
     * - Maior segurança e testabilidade com regras centralizadas.
     */

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

        // Segurança mantida...
        if (!carro.getProprietario().getEmail().equals(emailLogado)) {
            throw new IllegalStateException("Você não tem permissão para editar este veículo.");
        }

        // ATENÇÃO: atualização campo-a-campo. Considere:
        // - Validar cada campo do `dadosNovos` antes de aplicar
        // - Evitar sobrescrever campos sensíveis (ids, relacionamentos)
        // - Usar DTO + mapstruct para mapeamento controlado
        carro.setMarca(dadosNovos.getMarca());
        carro.setModelo(dadosNovos.getModelo());
        carro.setAno(dadosNovos.getAno());
        carro.setPlaca(dadosNovos.getPlaca());
        carro.setMatricula(dadosNovos.getMatricula());
        carro.setImageUrl(dadosNovos.getImageUrl()); // Salva a URL do Cloudinary
        carro.setPrecoPorDia(dadosNovos.getPrecoPorDia());

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