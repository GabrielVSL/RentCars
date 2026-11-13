<div align="center">
  <img width="70%" alt="pucminas" src="https://joaopauloaramuni.github.io/image/engsoft2.svg?raw=true"/>
</div>

<h1 align="center">Sistema de Aluguel de Carros</h1>

<div align="center">

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Micronaut](https://img.shields.io/badge/Micronaut-000000?style=for-the-badge&logo=micronaut&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)

**Laboratório de Desenvolvimento de Software — PUC Minas**

*Engenharia de Software · Prof. João Paulo Carneiro Aramuni*

</div>

---

## 📋 Sobre o Projeto

Aplicação web para gestão completa de aluguéis de automóveis, desenvolvida como projeto acadêmico na disciplina de **Laboratório de Desenvolvimento de Software** da PUC Minas.

O sistema permite que clientes realizem, modifiquem e cancelem pedidos de aluguel, enquanto agentes financeiros (empresas e bancos) avaliam e liberam contratos de crédito. O acesso à plataforma exige cadastro prévio com autenticação e controle de permissões.

### Atores do Sistema

| Ator | Permissões |
|---|---|
| **Cliente** | Introduzir, modificar, consultar e cancelar pedidos. |
| **Agente** (Empresa/Banco) | Modificar e avaliar pedidos financeiramente para liberar contratos. |

### Entidades Principais

- **Contratante** — RG, CPF, Nome, Endereço, Profissão, Empregadoras e até 3 rendimentos.
- **Automóvel** — Matrícula, Ano, Marca, Modelo, Preço por dia e Placa.
- **Contrato de Crédito** — Associado aos bancos e agentes financeiros após aprovação do pedido.

---

## 🏗️ Arquitetura

O sistema segue o padrão arquitetural **Cliente-Servidor via API RESTful**, dividido em duas camadas principais totalmente desacopladas:

- **Frontend (SPA)** — Interface rica e interativa construída com React.
- **Backend (API)** — Lógica de domínio, regras de negócio e persistência ultra-rápida com Micronaut.

```text
┌─────────────────────────────────────────┐
│              Frontend Web               │
│        (React / Framer / Tailwind)      │
└────────────────────┬────────────────────┘
                     │ HTTP / REST / JSON
┌────────────────────▼────────────────────┐
│              Servidor API               │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │  Security    │  │   Controllers    │ │
│  └──────────────┘  └────────┬─────────┘ │
│                             │           │
│                ┌────────────▼─────────┐ │
│                │   Facades / Services │ │
│                └────────────┬─────────┘ │
│                             │           │
│                ┌────────────▼─────────┐ │
│                │  Micronaut Data (DB) │ │
│                └──────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias Utilizadas

### Backend

- **Java 17+** — Linguagem principal
- **Micronaut Framework** — Framework de alta performance e baixo consumo de memória
- **Micronaut Data** — Camada de persistência e repositórios
- **Micronaut Security (JWT)** — Autenticação e controle de rotas por perfis (`ROLE_CLIENTE`, `ROLE_EMPRESA`, `ROLE_BANCO`)

### Frontend

- **React.js** — Biblioteca de UI
- **Tailwind CSS** — Estilização de utilitários
- **Framer Motion** — Animações fluidas de interface
- **Axios** — Consumo da API REST

---

## 📦 Entregas por Sprint

### ✅ Lab02S01 — Sprint 1: Modelagem UML

> **Foco:** Levantamento de requisitos e modelagem do sistema.

#### Diagrama de Casos de Uso

![Diagrama de Casos de Uso](./assets/DiagramaCasosDeUso.png)

#### 👤 Histórias de Usuário (User Stories)

**US01 — Cadastro de Cliente**

> Como um usuário não registrado, quero me cadastrar no sistema fornecendo meus dados de identificação e financeiros, para que eu tenha permissão de utilizar os serviços de aluguel.

**Regra de Negócio:** O cadastro deve armazenar obrigatoriamente RG, CPF, Nome, Endereço, Profissão, entidades empregadoras e os rendimentos auferidos (limitado ao máximo de 3).

---

**US02 — Introdução de Pedido**

> Como um cliente cadastrado, quero introduzir um novo pedido de aluguel no sistema, para solicitar a locação de um automóvel.

**Regra de Negócio:** O pedido deve ficar pendente de análise financeira e de disponibilidade pela empresa logo após a introdução.

---

**US03 — Gestão Própria de Pedidos (Cliente)**

> Como um cliente, quero consultar, aceitar revisões, modificar ou cancelar meus pedidos de aluguel ativos, para ter controle total sobre as minhas solicitações na plataforma.

---

**US04 — Avaliação Financeira (Agente)**

> Como um agente (empresa ou banco), quero analisar os pedidos introduzidos, para emitir um parecer (positivo ou negativo) sobre a execução do contrato.

---

**US05 — Modificação de Pedidos (Agente)**

> Como um agente (empresa ou banco), quero poder modificar os pedidos de aluguel (sugerir novas datas), para realizar ajustes de disponibilidade antes da aprovação.

---

**US06 — Concessão de Crédito e Propriedade**

> Como um agente bancário, quero associar um contrato de crédito aprovado ao aluguel de um automóvel, para financiar a operação do cliente.

---

#### Diagrama de Classes

![Diagrama de Classes](./assets/UML.png)

#### Diagrama de Pacotes

![Diagrama de Pacotes](./assets/DiagramaDePacotes.png)

---

### 🔄 Lab02S02 — Sprint 2: Componentes e CRUD do Cliente

> **Foco:** Diagrama de Componentes e implementação do CRUD do cliente.

#### Diagrama de Componentes

![Diagrama de Componentes](./assets/DiagramaComponentes.png)

#### Implementação do Frontend/Backend

- API RESTful desenvolvida com Micronaut.
- Telas de cadastro dinâmico baseadas em perfis com Hook Form e Zod no React.

---

### 🔄 Lab02S03 — Sprint 3: Implantação e Protótipo Final

> **Foco:** Diagrama de Implantação e protótipo funcional com criação e visualização de pedidos.

#### Diagrama de Implantação

![Diagrama de Componentes](./assets/DiagramaImplnatacao.png)

#### Protótipo Final

- Motor de Prevenção de Overbooking no Java.
- Calendário Premium unificado no React exibindo dias disponíveis/bloqueados em tempo real.
- Fluxo completo de aprovação (Cliente → Empresa → Banco).

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Java 21+
- Node.js 18+ (para o Frontend)
- Gradle (ou utilize o Gradle Wrapper `./gradlew` / `gradlew.bat` já incluído)

### Executando o Backend (Micronaut)

```bash
# Acesse o diretório do backend
cd backend

# No Linux/macOS:
./gradlew run

# No Windows (PowerShell / CMD):
.\gradlew.bat run
```

A API estará disponível em `http://localhost:8080`.

### Executando o Frontend (React + Vite)

```bash
# Acesse o diretório do frontend
cd frontend

# Instale as dependências (se ainda não instalou)
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação web estará disponível em `http://localhost:5173`.

---

## 🌐 Deploy em Produção (Gratuito e Profissional)

O projeto foi preparado com suporte a **Containerização Docker Multi-Stage**, **CORS Dinâmico** e **Rewrite SPA**, permitindo deploy em plataformas modernas e gratuitas:

### 1. Banco de Dados (PostgreSQL)
- **Supabase** (Recomendado para portfólio) ou **Neon.tech**:
  1. Crie um projeto gratuito PostgreSQL.
  2. Copie a Connection String JDBC (modo `sslmode=require`).

### 2. Backend (Micronaut no Java 21)
- **Koyeb** ou **Render** (via Dockerfile):
  1. Conecte o repositório GitHub.
  2. Configure:
     - **Root Directory**: `backend`
     - **Build Type**: `Dockerfile` (já configurado em `backend/Dockerfile` com imagem Alpine ultra-leve ~140MB).
  3. Adicione as Variáveis de Ambiente:
     - `JDBC_URL`: URL JDBC do PostgreSQL (ex: `jdbc:postgresql://host:5432/postgres?sslmode=require`).
     - `DB_USER`: Usuário do banco.
     - `DB_PASSWORD`: Senha do banco.
     - `JWT_SECRET`: Chave secreta de 256 bits.
     - `CORS_ALLOWED_ORIGINS`: URL do seu frontend na Vercel (ex: `https://meu-rentcars.vercel.app`).

### 3. Frontend (React + Vite)
- **Vercel**:
  1. Conecte o repositório GitHub.
  2. Configure:
     - **Root Directory**: `frontend`
     - **Framework Preset**: `Vite`
  3. Adicione a Variável de Ambiente:
     - `VITE_API_URL`: URL pública do seu backend (ex: `https://seu-backend.koyeb.app` ou `https://seu-backend.onrender.com`).
  4. O arquivo `frontend/vercel.json` já está configurado para garantir o roteamento de rotas diretas (SPA).
