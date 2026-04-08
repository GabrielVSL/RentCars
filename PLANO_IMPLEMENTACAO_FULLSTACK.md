# 📋 Plano de Implementação Completo - RentCars Full-Stack

## 🎯 Objetivo
Criar uma aplicação full-stack de aluguel de carros com backend Micronaut (Java) e frontend React + TypeScript, 100% gratuita para portfólio, integrada com APIs externas gratuitas (Unsplash para fotos).

---

## 🏗️ Arquitetura

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐
│   Frontend      │◄──────────────►│   Backend       │
│   React + TS    │   REST API     │   Micronaut     │
│   Port: 5173    │   Port: 8080   │   Port: 8080    │
└─────────────────┘                └─────────────────┘
         │                                    │
         │                                    ├─ CarroController
         │                                    ├─ CarroService
         │                                    ├─ CarroRepository
         │                                    └─ Carro (Entity)
         │
         └─ Unsplash API (fotos)
```

---

## 📦 Backend (Micronaut) - Sprint 1

### **1.1 Entidade Carro**
```java
// src/main/java/com/aluguel/models/Carro.java
@Serdeable
public class Carro {
    private Long id;
    private String marca;
    private String modelo;
    private Integer ano;
    private String categoria; // economy, compact, sedan, suv, luxury, sports
    private String transmissao; // automatic, manual
    private String combustivel; // gasoline, diesel, electric, hybrid
    private BigDecimal precoPorDia;
    private String imagem; // URL da foto (Unsplash)
    private List<String> features;
    private BigDecimal rating;
    private Integer reviewCount;
    private String localizacao; // cidade, estado
    private Boolean disponivel;
    
    // Construtores, getters, setters
}
```

### **1.2 Repository (In-Memory com dados mockados)**
```java
// src/main/java/com/aluguel/repositories/CarroRepository.java
@Singleton
public class CarroRepository {
    private final List<Carro> carros = new ArrayList<>();
    private final AtomicLong currentId = new AtomicLong(1);
    
    public CarroRepository() {
        // Popular com 50+ carros realistas
        this.carros.addAll(DataGenerator.criarCarrosMockados());
    }
    
    public List<Carro> findAll() { return carros; }
    public Optional<Carro> findById(Long id) { ... }
    public List<Carro> findByCategoria(String categoria) { ... }
    public List<Carro> findByDisponivel(Boolean disponivel) { ... }
    public List<Carro> buscarComFiltros(FiltroCarro filtro) { ... }
}
```

### **1.3 Service**
```java
// src/main/java/com/aluguel/services/CarroService.java
@Singleton
public class CarroService {
    private final CarroRepository repository;
    
    public List<Carro> listarTodos() { return repository.findAll(); }
    public List<Carro> buscarComFiltros(FiltroCarro filtro) { 
        return repository.buscarComFiltros(filtro); 
    }
    public Optional<Carro> buscarPorId(Long id) { return repository.findById(id); }
}
```

### **1.4 Controller**
```java
// src/main/java/com/aluguel/controllers/CarroController.java
@Controller("/api/carros")
public class CarroController {
    private final CarroService service;
    
    @Get
    public List<Carro> listar(
        @QueryValue(value = "categoria", defaultValue = "") String categoria,
        @QueryValue(value = "minPreco", defaultValue = "0") BigDecimal minPreco,
        @QueryValue(value = "maxPreco", defaultValue = "9999") BigDecimal maxPreco,
        @QueryValue(value = "disponivel", defaultValue = "true") Boolean disponivel
    ) {
        FiltroCarro filtro = new FiltroCarro(categoria, minPreco, maxPreco, disponivel);
        return service.buscarComFiltros(filtro);
    }
    
    @Get("/{id}")
    public HttpResponse<Carro> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
            .map(HttpResponse::ok)
            .orElse(HttpResponse.notFound());
    }
}
```

### **1.5 DTOs**
```java
// FiltroCarro.java - Classe simples para filtros
public record FiltroCarro(
    String categoria,
    BigDecimal minPreco,
    BigDecimal maxPreco,
    Boolean disponivel
) {}
```

### **1.6 DataGenerator (50+ carros realistas)**
```java
public class DataGenerator {
    public static List<Carro> criarCarrosMockados() {
        return List.of(
            new Carro(1L, "Fiat", "Mobi Like", 2023, "economy", "manual", "gasoline", 
                    89.0, buscarFotoUnsplash("fiat-mobi"), 
                    List.of("Ar condicionado", "Direção elétrica"), 
                    4.8, 124, "Belo Horizonte, MG", true),
            new Carro(2L, "Volkswagen", "Gol Trend", 2024, "compact", "manual", "gasoline",
                    109.0, buscarFotoUnsplash("volkswagen-gol"),
                    List.of("Ar condicionado", "Som Bluetooth", "Airbag"),
                    4.7, 89, "São Paulo, SP", true),
            // ... +48 carros mais
        );
    }
    
    private static String buscarFotoUnsplash(String query) {
        // Retorna URL already cached ou chama API do Unsplash
        return "https://images.unsplash.com/photo-..."; // URLs reais
    }
}
```

---

## 🎨 Frontend (React + TS) - Sprint 2

### **2.1 Serviço de API**
```typescript
//src/services/carService.ts
const API_URL = 'http://localhost:8080/api/carros';

export interface Carro {
  id: number;
  marca: string;
  modelo: string;
  ano: number;
  categoria: 'economy' | 'compact' | 'sedan' | 'suv' | 'luxury' | 'sports';
  transmissao: 'automatic' | 'manual';
  combustivel: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  precoPorDia: number;
  imagem: string;
  features: string[];
  rating: number;
  reviewCount: number;
  localizacao: string;
  disponivel: boolean;
}

export interface FiltroCarro {
  categoria?: string;
  minPreco?: number;
  maxPreco?: number;
  disponivel?: boolean;
}

export const carService = {
  getAll: async (filtros?: FiltroCarro): Promise<Carro[]> => {
    const params = new URLSearchParams();
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.minPreco) params.append('minPreco', filtros.minPreco.toString());
    if (filtros?.maxPreco) params.append('maxPreco', filtros.maxPreco.toString());
    if (filtros?.disponivel !== undefined) params.append('disponivel', filtros.disponivel.toString());
    
    const res = await fetch(`${API_URL}?${params}`);
    return res.json();
  },
  
  getById: async (id: number): Promise<Carro> => {
    const res = await fetch(`${API_URL}/${id}`);
    return res.json();
  }
};
```

### **2.2 Hook personalizado**
```typescript
// src/hooks/useCarros.ts
export function useCarros(filtros: FiltroCarro = {}) {
  const [carros, setCarros] = useState<Carro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchCarros();
  }, [JSON.stringify(filtros)]);
  
  const fetchCarros = async () => {
    try {
      setLoading(true);
      const data = await carService.getAll(filtros);
      setCarros(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar carros');
    } finally {
      setLoading(false);
    }
  };
  
  return { carros, loading, error, refetch: fetchCarros };
}
```

### **2.3 Página de Carros com Filtros**
```tsx
// src/pages/CarsPage.tsx
export default function CarsPage() {
  const [filtros, setFiltros] = useState<FiltroCarro>({
    disponivel: true
  });
  
  const { carros, loading, error } = useCarros(filtros);
  
  const handleFiltroChange = (novosFiltros: Partial<FiltroCarro>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carros Disponíveis</h1>
      
      {/* Painel de Filtros */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Categoria"
            options={CATEGORIAS}
            value={filtros.categoria || ''}
            onValueChange={(cat) => handleFiltroChange({ categoria: cat })}
          />
          
          <Select
            label="Transmissão"
            options={TRANSMISSOES}
            value={filtros.transmissao || ''}
            onValueChange={(trans) => handleFiltroChange({ transmissao: trans })}
          />
          
          <Input
            label="Preço mínimo"
            type="number"
            value={filtros.minPreco || ''}
            onChange={(e) => handleFiltroChange({ minPreco: Number(e.target.value) })}
          />
          
          <Input
            label="Preço máximo"
            type="number"
            value={filtros.maxPreco || ''}
            onChange={(e) => handleFiltroChange({ maxPreco: Number(e.target.value) })}
          />
        </div>
      </div>
      
      {/* Grid de Carros */}
      {loading ? (
        <div>Carregando...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carros.map((carro, idx) => (
            <CarCard key={carro.id} car={carro} index={idx} onSelect={/*...*/} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Integração Frontend-Backend

### **2.4 Configuração CORS (Micronaut)**
```java
// src/main/java/com/aluguel/CorsConfiguration.java
@Singleton
public class CorsConfiguration {
    @Event ListenableFuture<BuiltResponse> onRequest(HttpRequest<?> request, HttpResponse<?> response) {
        response.getHeaders().add("Access-Control-Allow-Origin", "http://localhost:5173");
        response.getHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.getHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.getHeaders().add("Access-Control-Allow-Credentials", "true");
        return HttpResponse.ok();
    }
}
```

### **2.5 Vite Proxy (evitar CORS)**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

Assim no frontend usa `/api/carros` e o Vite redireciona para `localhost:8080`.

---

## 📸 Unsplash API (Fotos Gratuitas)

### **3.1 Criar conta gratuita**
1. Acesse: https://unsplash.com/developers
2. Clique "Your Application" → "New Application"
3. Nome: "RentCars Portfolio"
4. aceite termos
5. Copie `Access Key`

### **3.2 Backend cache de fotos**
```java
// No DataGenerator:
private static final Map<String, String> FOTO_CACHE = new HashMap<>();
private static final String UNSPLASH_ACCESS_KEY = "SUA_CHAVE_AQUI";

private static String buscarFotoUnsplash(String query) {
    if (FOTO_CACHE.containsKey(query)) {
        return FOTO_CACHE.get(query);
    }
    
    // Implementar chamada HTTP para Unsplash Search API
    // https://api.unsplash.com/search/photos?query={query}&client_id={key}
    
    // Por ora, usar URLs fixas de exemplo
    String url = "https://images.unsplash.com/photo-" + query + "?auto=format&fit=crop&w=800";
    FOTO_CACHE.put(query, url);
    return url;
}
```

---

## ✅ Checklist de Entregas

### **Backend (Concluído)**
- [x] Estrutura Micronaut existente (Cliente)
- [ ] Criar entidade `Carro`
- [ ] Criar `CarroRepository` com mock de 50+ carros
- [ ] Implementar `CarroService` com filtros
- [ ] Criar `CarroController` RESTful
- [ ] Testar endpoints no Postman/Insomnia

### **Frontend (Concluído)**
- [x] Estrutura feature-driven criada
- [x] Componentes UI (Button, Input, Select, Card)
- [x] SearchHero funcionando
- [x] CarCard com Framer Motion
- [ ] Criar `carService.ts` (consumir API)
- [ ] Criar hook `useCarros`
- [ ] Atualizar `MOCK_CARS` → `carService.getAll()`
- [ ] Adicionar filtros na página `/cars`
- [ ] Testar integração completa

### **Deploy (Portfólio)**
- [ ] Backend: Railway/Render (grátis)
- [ ] Frontend: Vercel/Netlify (grátis)
- [ ] Configurar CORS para produção
- [ ] Documentar no README.md

---

## 🎯 Próximos Passos Imediatos

### **Backend (Hoje)**
1. Criar `Carro.java` entity
2. Criar `DataGenerator.java` com 50 carros
3. Criar `CarroRepository.java`
4. Criar `CarroService.java`
5. Criar `CarroController.java`
6. Testar: `curl http://localhost:8080/api/carros`

### **Frontend (Amanhã)**
1. Criar `carService.ts`
2. Atualizar `CarCard` para receber `Carro` da API
3. Criar página `/cars` com filtros
4. Testar integração

---

## 📊 Dados Mockados Realistas (Exemplo)

```json
{
  "id": 1,
  "marca": "Toyota",
  "modelo": "Corolla Cross",
  "ano": 2024,
  "categoria": "suv",
  "transmissao": "automatic",
  "combustivel": "hybrid",
  "precoPorDia": 229.90,
  "imagem": "https://images.unsplash.com/photo-xxx...",
  "features": ["Hybrid Flex", "Tet Solar", "Assistente de faixa", "Airbag"],
  "rating": 4.9,
  "reviewCount": 167,
  "localizacao": "Belo Horizonte, MG",
  "disponivel": true
}
```

---

## 🔧 Considerações Técnicas

### **Backend**
- Usar `@Serdeable` para JSON automático
- Injetar dependências com `@Singleton` e `@Inject`
- Validar inputs com `@Validated`
- Documentar com Swagger (OpenAPI) - opcional

### **Frontend**
- Loading states em todas as chamadas
- Erro 404 para carro não encontrado
- Filtros aplicados no backend (performance)
- Cache de imagens no frontend (evitar refetch)
- Responsivo mobile-first

---

## 📈 Métricas de Sucesso (Portfólio)

✅ **Backend funcional**: +50 endpoints, 200+ linhas de código Java  
✅ **Frontend moderno**: React 19, TypeScript strict, Framer Motion  
✅ **Integração real**: Frontend consome backend próprio  
✅ **Fotos verdadeiras**: Unsplash API com cache  
✅ **UX premium**: Formulário otimizado, animações suaves  
✅ **Código limpo**: Feature-driven, separação de responsabilidades  
✅ **Deploy online**: Ambas as partes no ar (gratuito)  

---

**Pronto para implementar!** Quando quiser começar, digita "vamos começar pelo backend" ou "vamos começar pelo frontend" que eu guio passo a passo. 🚀