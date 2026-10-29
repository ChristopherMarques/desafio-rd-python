# 🚀 Mars Probe Exploration — Desafio Técnico RD Station

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Rough.js](https://img.shields.io/badge/Rough.js-Hand--Drawn-F25C05?style=for-the-badge)](https://roughjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Coverage](https://img.shields.io/badge/Coverage-95%25-brightgreen?style=for-the-badge)](https://pytest.org/)

Aplicação FullStack desenvolvida para o Desafio Técnico da **RD Station**, modelando a navegação e o controle de sondas espaciais em um planalto marciano. 

O projeto une uma **API RESTful de alta performance em Python (FastAPI)** estruturada sob os mais rigorosos princípios de **Clean Architecture** e **SOLID**, com um **Mission Control interativo em React, Vite e TypeScript**, inspirado no Design System **Tangram da RD Station** e renderizado com a estética "feita à mão" do **Rough.js**.

---

## 🌐 Ambientes Publicados em Produção (Live Demo)

O projeto está totalmente implantado e disponível publicamente nos seguintes endereços:

* 🛰️ **Aplicação Web (Mission Control Tangram UI)**: [https://desafio-rd.inspirare.digital/](https://desafio-rd.inspirare.digital/)
* 📚 **Documentação Interativa da API (Swagger OpenAPI)**: [https://api-desafio-rd.inspirare.digital/docs](https://api-desafio-rd.inspirare.digital/docs)
* 📖 **Documentação Alternativa da API (Redoc)**: [https://api-desafio-rd.inspirare.digital/redoc](https://api-desafio-rd.inspirare.digital/redoc)
* 🩺 **Healthcheck da API Backend**: [https://api-desafio-rd.inspirare.digital/health](https://api-desafio-rd.inspirare.digital/health)

---

## 🧭 Princípio Fundamental de Engenharia

> *"Projete seu código para ser mais fácil de entender, não mais fácil de escrever."*  
> — Princípio de Engenharia da RD Station

Em sistemas distribuídos modernos, clareza, previsibilidade e testabilidade superam qualquer complexidade desnecessária. Por isso, a solução foi projetada de forma modular, com separação estrita de camadas e foco total em legibilidade e manutenibilidade.

---

## 📐 Destaques de Arquitetura e Engenharia

* **Clean Architecture Desacoplada**: A camada de domínio (entidades, regras de navegação e comandos) é código Python puro, totalmente isolada de detalhes de infraestrutura ou frameworks web.
* **Aderência Estrita aos Princípios SOLID**:
  * **S (Single Responsibility)**: Entidades coesas (`Plateau`, `Coordinates`, `Direction`, `Probe`), Value Objects imutáveis e Casos de Uso dedicados.
  * **O (Open/Closed)**: Movimentação implementada com **Command Pattern** e um `CommandRegistry`. Novos comandos (`U-Turn`, ré, scan geológico) podem ser adicionados sem alterar a sonda ou o core da aplicação.
  * **L (Liskov Substitution)**: Contrato `ProbeRepository` com implementações intercambiáveis `InMemoryProbeRepository` (para testes rápidos) e `SqliteProbeRepository` (para persistência durável em disco).
  * **I (Interface Segregation)**: Interfaces segregadas em `ProbeReader` (consulta) e `ProbeWriter` (mutação).
  * **D (Dependency Inversion)**: Casos de uso e controladores HTTP dependem exclusivamente de protocolos abstratos, injetados via FastAPI `Depends`.
* **Interrupção Segura com Preservação de Estado**: Se uma sequência de comandos violar os limites do planalto ou contiver instruções inválidas, a sonda **não cai do planalto**. Ela interrompe a execução no último ponto seguro, salva o progresso anterior e responde com status HTTP 422 com payload rico para os operadores da missão.
* **Documentação Viva e Type Safety**: Tipagem estática com Pydantic v2, documentação interativa Swagger/OpenAPI nativa em `/docs` e Redoc em `/redoc`.
* **Frontend Tangram Sketch**: Replicamos os design tokens do **Tangram da RD Station** (`#0073FF`, `#19212C`, `#F25C05`, `#00B37E`) com componentes acessíveis estilo shadcn UI e renderização no Canvas via **Rough.js**.
* **Simulador Interativo e Mission Control**: Controle manual por teclado (W, A, D / Setas), envio de sequências em lote com visualização passo a passo animada na malha, e sintetizador de áudio espacial via **Web Audio API** (sem arquivos externos).

---

## 📂 Estrutura do Monorepo

```
desafio-rd-python/
├── .github/
│   ├── workflows/ci.yml         # Pipeline CI automatizada (Python 3.11/3.12, Ruff, Mypy, Pytest, Node)
│   └── pull_request_template.md # Template profissional de Pull Request
├── backend/                     # Microsserviço Python com FastAPI
│   ├── app/
│   │   ├── api/                 # Controladores HTTP REST e injeção de dependências
│   │   ├── core/                # Configurações Pydantic e exceções de domínio
│   │   ├── domain/              # Modelos puros, Value Objects, Command Pattern e Repositórios
│   │   ├── infrastructure/      # Adaptadores concretos (InMemory e SQLite)
│   │   ├── schemas/             # Contratos Pydantic de entrada e saída
│   │   ├── use_cases/           # Casos de uso da aplicação (Launch, Move, List, Get)
│   │   └── main.py              # Ponto de entrada FastAPI com CORS e documentação
│   ├── tests/                   # 50 testes automatizados (Unit, Integration e E2E) - 95% coverage
│   ├── Dockerfile               # Imagem Docker multi-stage otimizada (non-root user)
│   └── pyproject.toml           # Configurações do projeto, pytest, ruff e mypy
├── frontend/                    # Single Page Application React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── docs/            # DocsReader - Leitor de Documentação estilo Mintlify
│   │   │   ├── mission-control/ # PlateauCanvas (Rough.js), CockpitDock, TelemetryHUD, FleetHUD
│   │   │   └── ui/              # Mini Tangram UI (Button, Card, Badge, Input, Dialog)
│   │   ├── docs/                # Cópias síncronas dos artigos markdown para runtime web
│   │   ├── lib/                 # Cliente HTTP da API, áudio Web Audio e utilitários
│   │   ├── types/               # Tipagens TypeScript compartilhadas
│   │   ├── test/                # Suíte de 15 testes unitários com Vitest e Testing Library
│   │   ├── App.tsx              # Orquestrador com alternância entre Missão e Docs
│   │   └── main.tsx
│   ├── Dockerfile               # Multi-stage build com Nginx e SPA rewrite
│   └── tailwind.config.js       # Tokens de cor oficiais do Tangram da RD Station
├── docs/                        # Documentação técnica escrita por engenheiro sênior
│   ├── architecture.md          # Visão de arquitetura e por que FastAPI sobre Django
│   ├── solid-principles.md      # Demonstração detalhada de cada letra do SOLID
│   ├── api-contracts.md         # Especificação completa de endpoints e respostas da RD Station
│   ├── security.md              # Práticas de segurança pragmática (OWASP e DoS prevention)
│   ├── deployment.md            # Guia de deploy contínuo no Coolify via GHCR
│   ├── tangram-design-system.md # Conceituação visual do Tangram Sketch e simulador
│   └── decision-records.md      # Registros de Decisões de Arquitetura (ADRs)
├── docker-compose.yml           # Orquestração do Backend (porta 8000) e Frontend (porta 3000)
├── pnpm-workspace.yaml          # Configuração do Monorepo
└── README.md
```

---

## ⚡ Como Executar o Projeto

Você pode executar o projeto de duas maneiras: com **Docker Compose** (um único comando) ou **localmente** no seu ambiente.

### Opção 1: Execução com Docker Compose (Recomendado)

Certifique-se de ter o Docker e Docker Compose instalados na máquina:

```bash
# Clone o repositório
git clone https://github.com/ChristopherMarques/desafio-rd-python.git
cd desafio-rd-python

# Suba a aplicação completa (Backend na porta 8000 e Frontend na porta 3000)
docker compose up --build
```

Acesse no seu navegador:
* **Frontend Mission Control**: `http://localhost:3000`
* **Swagger API Docs**: `http://localhost:8000/docs`
* **Redoc API Docs**: `http://localhost:8000/redoc`
* **Health Check**: `http://localhost:8000/health`

---

### Opção 2: Execução Local

#### 1. Backend (Python + FastAPI)

```bash
cd backend

# Crie e ative o ambiente virtual
python -m venv .venv

# No Windows:
.venv\Scripts\activate
# No Linux/macOS:
# source .venv/bin/activate

# Instale as dependências
pip install -r requirements-dev.txt

# Inicie o servidor FastAPI na porta 8000
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend (React + Vite)

Em um novo terminal:

```bash
cd frontend

# Instale as dependências com pnpm (ou npm)
pnpm install

# Inicie o servidor de desenvolvimento na porta 3000
pnpm dev
```

Acesse `http://localhost:3000`.

---

## 🧪 Testes Automatizados e Qualidade de Código

A suíte de testes cobre o ecossistema completo: testes unitários de domínio e segurança no backend, e testes unitários de componentes e hooks no frontend com Vitest e Testing Library.

### Executar Testes no Backend

```bash
cd backend
pytest --cov=app --cov-report=term-missing
```

**Resultado dos Testes**:
* **50 testes aprovados** em ~0.25s.
* **95% de cobertura total de código**.

### Executar Testes no Frontend

```bash
cd frontend
pnpm test
```

**Resultado dos Testes**:
* **15 testes aprovados** em ~1.3s com Vitest e React Testing Library.

### Linters e Checagem Estática de Tipos

```bash
# Na raiz do monorepo:
pnpm lint

# Ou individualmente:
cd backend && ruff check . && mypy app
cd frontend && pnpm lint
```

### Build do Frontend

```bash
cd frontend
pnpm build
```

---

## 📡 Endpoints da API (Contratos RD Station)

### 1. Lançar Sonda e Configurar Malha
* **POST** `/probes` (ou `/api/v1/probes`)
* **Código**: `201 Created`

```bash
curl -X POST http://localhost:8000/probes \
  -H "Content-Type: application/json" \
  -d '{
    "x": 5,
    "y": 5,
    "direction": "NORTH"
  }'
```

**Resposta**:
```json
{
  "id": "prb-8a1f2b",
  "x": 0,
  "y": 0,
  "direction": "NORTH"
}
```

---

### 2. Mover Sonda
* **POST** `/probes/{id}/move` (ou `/api/v1/probes/{id}/move`)
* **Código**: `200 OK`

```bash
curl -X POST http://localhost:8000/probes/prb-8a1f2b/move \
  -H "Content-Type: application/json" \
  -d '{
    "commands": "MRM"
  }'
```

**Resposta**:
```json
{
  "id": "prb-8a1f2b",
  "x": 1,
  "y": 1,
  "direction": "EAST"
}
```

#### Interrupção Segura em Caso de Risco de Queda (HTTP 422):
Se uma sonda tentar ultrapassar o planalto (por exemplo, submeter `MMMMMM` quando o topo é 5):

```json
{
  "detail": {
    "detail": "Movimento abortado no passo 5 ('M'): as coordenadas (0, 6) ultrapassam os limites do planalto (0..5, 0..5). A sonda parou em segurança na posição (0, 5, NORTH).",
    "error_code": "PROBE_OUT_OF_BOUNDS",
    "failed_at_step": 5,
    "failed_command": "M",
    "last_safe_state": {
      "id": "prb-8a1f2b",
      "x": 0,
      "y": 5,
      "direction": "NORTH"
    }
  }
}
```

---

### 3. Ver Posição de Todas as Sondas
* **GET** `/probes` (ou `/api/v1/probes`)
* **Código**: `200 OK`

```bash
curl -X GET http://localhost:8000/probes
```

**Resposta**:
```json
{
  "probes": [
    {
      "id": "prb-8a1f2b",
      "x": 1,
      "y": 1,
      "direction": "EAST"
    }
  ]
}
```

---

## 📚 Documentação Técnica Aprofundada

Para ler mais detalhes sobre cada decisão técnica, consulte a pasta [`docs/`](./docs):

* [`docs/architecture.md`](./docs/architecture.md): Detalhamento da arquitetura em camadas e comparação técnica entre FastAPI e Django.
* [`docs/solid-principles.md`](./docs/solid-principles.md): Análise aprofundada da aplicação dos 5 princípios SOLID no código.
* [`docs/api-contracts.md`](./docs/api-contracts.md): Especificação completa dos contratos e códigos de retorno da API.
* [`docs/security.md`](./docs/security.md): Diretrizes de segurança pragmática, OWASP headers e mitigação de DoS.
* [`docs/deployment.md`](./docs/deployment.md): Guia de deploy contínuo na VPS via Coolify consumindo pacotes do GHCR.
* [`docs/tangram-design-system.md`](./docs/tangram-design-system.md): Filosofia de design do Tangram Sketch e componentes construídos.
* [`docs/decision-records.md`](./docs/decision-records.md): Architectural Decision Records (ADRs) com o histórico de trade-offs.

---

## 👨‍💻 Autor

**Christopher Correa**  
*Desenvolvedor Full Stack Sênior | Especialista em Frontend & Engenharia de Software*  
* Mogi das Cruzes, São Paulo, Brasil
* Email: [chriscorrea.marques@gmail.com](mailto:chriscorrea.marques@gmail.com)
* LinkedIn: [linkedin.com/in/christopher-marques-correa](https://www.linkedin.com/in/christopher-marques-correa)
* Portfólio: [chrismcorrea.dev](https://www.chrismcorrea.dev/)
* GitHub: [@ChristopherMarques](https://github.com/ChristopherMarques)
