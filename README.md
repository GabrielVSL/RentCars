<div align="center">
  <img width="70%" alt="pucminas" src="https://joaopauloaramuni.github.io/image/engsoft2.svg?raw=true"/>
</div>

<h1 align="center">Sistema de Aluguel de Carros</h1>

<div align="center">

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)

**Laboratório de Desenvolvimento de Software — PUC Minas**

*Engenharia de Software · Prof. João Paulo Carneiro Aramuni*

</div>

---

## 📋 Sobre o Projeto

Aplicação web para gestão completa de aluguéis de automóveis, desenvolvida como projeto acadêmico na disciplina de **Laboratório de Desenvolvimento de Software** da PUC Minas.

O sistema permite que clientes realizem, modifiquem e cancelem pedidos de aluguel, enquanto agentes financeiros (empresas e bancos) avaliam e liberam contratos de crédito. O acesso à plataforma exige cadastro prévio.

### Atores do Sistema

| Ator | Permissões |
|---|---|
| **Cliente** | Introduzir, modificar, consultar e cancelar pedidos |
| **Agente** (empresa/banco) | Modificar e avaliar pedidos financeiramente para liberar contratos |

### Entidades Principais

- **Contratante** — RG, CPF, Nome, Endereço, Profissão, Empregadoras e até 3 rendimentos
- **Automóvel** — Matrícula, Ano, Marca, Modelo e Placa (propriedade pode ser do cliente, empresa ou banco)
- **Contrato de Crédito** — Associado aos bancos e agentes financeiros

---

## 🏗️ Arquitetura

O sistema segue o padrão arquitetural **MVC (Model-View-Controller)** com um servidor central acessado via Internet, dividido em duas camadas principais:

- **Gestão de Negócios** — lógica de domínio, regras de negócio e persistência
- **Construção de Páginas Web** — camada de apresentação e interface com o usuário

```
┌─────────────────────────────────────────┐
│              Cliente / Browser           │
└────────────────────┬────────────────────┘
                     │ HTTP/HTTPS
┌────────────────────▼────────────────────┐
│           Servidor Central              │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │  View (Web)  │  │  Controller (MVC)│ │
│  └──────────────┘  └────────┬─────────┘ │
│                             │           │
│               ┌─────────────▼─────────┐ │
│               │    Model / Service    │ │
│               └─────────────┬─────────┘ │
│                             │           │
│               ┌─────────────▼─────────┐ │
│               │      Database         │ │
│               └───────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias Utilizadas

- **Java** — Linguagem principal
- **Spring Boot** — Framework base da aplicação
- **Spring MVC** — Camada de apresentação e roteamento
- **Maven** — Gerenciamento de dependências e build

---

## 📦 Entregas por Sprint

### ✅ Lab02S01 — Sprint 1: Modelagem UML

> **Foco:** Levantamento de requisitos e modelagem do sistema.

#### Diagrama de Casos de Uso

<img src="./assets/DiagramaCasosDeUso.png">

#### 👤 Histórias de Usuário (User Stories)

**US01 — Cadastro de Cliente**
> Como um usuário não registrado, quero me cadastrar no sistema fornecendo meus dados de identificação e financeiros, para que eu tenha permissão de utilizar os serviços de aluguel.

- **Regra de Negócio:** O cadastro deve armazenar obrigatoriamente RG, CPF, Nome, Endereço, Profissão, entidades empregadoras e os rendimentos auferidos (limitado ao máximo de 3).

---

**US02 — Introdução de Pedido**
> Como um cliente cadastrado, quero introduzir um novo pedido de aluguel no sistema, para solicitar a locação de um automóvel.

- **Regra de Negócio:** O pedido deve ficar pendente de análise financeira pelos agentes logo após a introdução.

---

**US03 — Gestão Própria de Pedidos (Cliente)**
> Como um cliente, quero consultar, modificar ou cancelar meus pedidos de aluguel ativos, para ter controle total sobre as minhas solicitações na plataforma.

---

**US04 — Avaliação Financeira (Agente)**
> Como um agente (empresa ou banco), quero analisar os pedidos introduzidos do ponto de vista financeiro, para emitir um parecer (positivo ou negativo) sobre a execução do contrato.

---

**US05 — Modificação de Pedidos (Agente)**
> Como um agente (empresa ou banco), quero poder modificar os pedidos de aluguel dos clientes, para realizar ajustes contratuais ou financeiros antes da aprovação.

---

**US06 — Concessão de Crédito e Propriedade**
> Como um agente bancário, quero associar um contrato de crédito aprovado ao aluguel de um automóvel, para financiar a operação do cliente.

- **Regra de Negócio:** Dependendo do contrato firmado, o sistema deve registrar a propriedade do automóvel em nome do cliente, da empresa ou do banco.

#### Diagrama de Classes

<img src="./assets/DiagramaDeClasses.png">

#### Diagrama de Pacotes

<img src="./assets/DiagramaDePacotes.png">

---

### 🔄 Lab02S02 — Sprint 2: Componentes e CRUD do Cliente

> **Foco:** Diagrama de Componentes e implementação do CRUD do cliente.

#### Diagrama de Componentes

<!-- Insira o Diagrama de Componentes aqui -->

#### CRUD do Cliente

<!-- Descreva ou adicione screenshots da implementação aqui -->

---

### 🔄 Lab02S03 — Sprint 3: Implantação e Protótipo Final

> **Foco:** Diagrama de Implantação e protótipo funcional com criação e visualização de pedidos.

#### Diagrama de Implantação

<!-- Insira o Diagrama de Implantação aqui -->

#### Protótipo Final

<!-- Adicione screenshots ou descrição do protótipo aqui -->

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Java 17+
- Maven 3.8+

### Passos

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/seu-repositorio.git

# Acesse o diretório
cd seu-repositorio

# Instale as dependências e compile
mvn clean install

# Execute a aplicação
mvn spring-boot:run
```

A aplicação estará disponível em `http://localhost:8080`.

---

## 👨‍💻 Autor

Feito como projeto acadêmico para a disciplina de **Laboratório de Desenvolvimento de Software** — PUC Minas.
