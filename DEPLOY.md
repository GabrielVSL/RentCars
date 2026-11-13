# 🚀 Guia de Deploy em Produção (100% Gratuito & Alta Performance)

Este documento descreve as opções recomendadas para publicar o ecossistema **Apex Track Experience & ApexPay** (Backend Micronaut Java 21, Frontend React + Vite e Banco PostgreSQL).

---

## 🏗️ Arquitetura Recomendada (Foco em Currículo / Portfólio)

A stack recomendada demonstra versatilidade em **Edge Delivery**, **Containerização Docker** e **BaaS Corporativo**:

```
[ Frontend: Vercel (Edge CDN) ]
             │
             ▼ (HTTPS / REST)
[ Backend: Koyeb ou Render (Docker Multi-Stage / JRE 21 Alpine) ]
             │
             ▼ (JDBC com SSL / Connection Pooler)
[ Banco de Dados: Supabase ou Neon (PostgreSQL 15+) ]
```

### Por que esta composição?
- **Frontend na Vercel**: Líder da indústria para SPAs React, com deploy contínuo via Git, SSL automático e CDN global.
- **Backend via Docker no Koyeb**: Inicialização instantânea, roteamento global de borda e menor latência de *cold start* em relação ao Render tradicional.
- **PostgreSQL no Supabase**: Ferramenta corporativa de BaaS com pool de conexões (*Supavisor*), backups automáticos e explorador visual de dados.

---

## 🗄️ Etapa 1: Banco de Dados (Supabase ou Neon)

### Opção A: Supabase (Recomendado)
1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita.
2. Crie um novo projeto (ex: `rentcars-production`) e defina uma senha forte.
3. No painel do projeto, vá em **Project Settings** → **Database**.
4. Na seção **Connection String**, selecione a aba **JDBC** (ou Connection Pooling via porta `6543`).
5. A URL terá o formato:
   ```
   jdbc:postgresql://aws-0-[regiao].pooler.supabase.com:6543/postgres?sslmode=require
   ```

### Opção B: Neon.tech (Alternativa Serverless)
1. Acesse [neon.tech](https://neon.tech) e crie um projeto.
2. Copie a connection string JDBC fornecida no Dashboard:
   ```
   jdbc:postgresql://ep-[id].[regiao].aws.neon.tech/neondb?sslmode=require
   ```

---

## ⚙️ Etapa 2: Backend (Koyeb ou Render)

O repositório já inclui um **Dockerfile Multi-Stage** otimizado em `backend/Dockerfile` que gera um container Alpine leve (~140MB) com flags de baixa alocação de memória para planos gratuitos.

### Opção A: Koyeb (Recomendado)
1. Acesse [koyeb.com](https://www.koyeb.com) e conecte sua conta do GitHub.
2. Clique em **Create App** e selecione o repositório do projeto.
3. Na seção de configuração:
   - **Work Directory**: `backend`
   - **Builder**: Selecione `Dockerfile` (ele detectará `backend/Dockerfile`).
4. Em **Environment Variables**, adicione:
   | Variável | Descrição / Exemplo |
   | :--- | :--- |
   | `PORT` | `8080` |
   | `JDBC_URL` | Sua URL JDBC do Supabase ou Neon com `?sslmode=require` |
   | `DB_USER` | Usuário do banco (ex: `postgres` no Supabase) |
   | `DB_PASSWORD` | Senha configurada no banco |
   | `JWT_SECRET` | Chave de 256 bits (ex: string aleatória de 32+ caracteres) |
   | `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:5173` |
5. Clique em **Deploy**. Ao finalizar, anote a URL pública gerada (ex: `https://seu-app.koyeb.app`).

### Opção B: Render
1. Acesse [render.com](https://render.com) e crie um **New Web Service**.
2. Conecte o repositório e configure:
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `Dockerfile`
3. Configure as mesmas variáveis de ambiente listadas na tabela acima.
4. Conclua o deploy e copie a URL (ex: `https://seu-app.onrender.com`).

---

## 💻 Etapa 3: Frontend (Vercel)

O repositório já possui o arquivo `frontend/vercel.json` configurado para reescrever rotas SPA para o `index.html`.

1. Acesse [vercel.com](https://vercel.com) e conecte o repositório GitHub.
2. Clique em **Import Project** e defina:
   - **Root Directory**: Clique em *Edit* e selecione `frontend`.
   - **Framework Preset**: `Vite` (detectado automaticamente).
3. Na seção **Environment Variables**, adicione:
   | Variável | Valor |
   | :--- | :--- |
   | `VITE_API_URL` | URL pública do backend gerada na Etapa 2 (sem barra no final) |
4. Clique em **Deploy**.
5. Copie o domínio gerado na Vercel (ex: `https://rentcars-apex.vercel.app`).
6. *(Opcional)*: Volte nas variáveis do Backend e adicione este domínio exato em `CORS_ALLOWED_ORIGINS`.

---

## 🔒 Credenciais Padrão do Administrador

Ao subir o backend pela primeira vez em um banco de dados novo, o `DataInitializer` criará o administrador executivo:

- **E-mail**: `admin@apex.com`
- **Senha**: `123456`
- **Painel**: `/admin` (liberado para aprovação de sessões, auditoria de crédito e telemetria de frotas).

---

## 🔍 Checklist de Validação Pós-Deploy

- [ ] Acessar a URL do Frontend na Vercel e verificar se a Landing Page carrega sem erros de console.
- [ ] Testar login com `admin@apex.com` / `123456`.
- [ ] Recarregar a página (F5) em rotas internas (`/login`, `/admin`, `/pistas`) para confirmar que o `vercel.json` preveniu erro 404.
- [ ] Criar um novo cadastro de piloto e verificar se a sessão foi registrada no banco PostgreSQL.
- [ ] Acessar `/swagger-ui` na URL do backend para verificar a documentação interativa da API.
