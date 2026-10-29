# Registro de Decisões de Arquitetura (ADRs)

Este documento registra as principais decisões de engenharia que tomei no desenvolvimento da solução, apresentando o contexto, as opções avaliadas, a decisão tomada e as consequências técnicas observadas.

---

## ADR 01: Escolha do Framework Web Backend (FastAPI vs Django)

### Contexto
O desafio exige o desenvolvimento de uma API em Python para controle de sondas marcianas, permitindo qualquer biblioteca ou framework (FastAPI, Flask, Django, etc.).

### Decisão
Optei pelo FastAPI versão 0.115+.

### Justificativa
1. O desafio avalia lógica de domínio puro (orientação cardinal, malha cartesiana e validação de comandos). Django traz consigo acoplamento com ORM relacional e serviços administrativos que gerariam sobrecarga desnecessária.
2. FastAPI oferece tipagem estática moderna via Pydantic v2 e geração automática de documentação Swagger OpenAPI em /docs, alinhando-se ao princípio da RD Station de projetar código fácil de entender.
3. Desacoplamento arquitetural: mantive as entidades de domínio e casos de uso sem nenhuma importação do FastAPI, permitindo testabilidade total sem necessidade de subir servidores ou emular requisições HTTP em testes unitários.

---

## ADR 02: Padrão Command com Registry para Movimentação da Sonda

### Contexto
A sonda executa comandos de avançar (M), girar à esquerda (L) e girar à direita (R). Requisitos futuros podem demandar novas instruções de exploração.

### Decisão
Implementei o Padrão de Projeto Command (app/domain/commands) coordenado por um CommandRegistry.

### Justificativa
1. Elimina estruturas condicionais encadeadas (if ou switch) na entidade da sonda e no caso de uso.
2. Atende ao Princípio Aberto e Fechado (OCP): novos comandos podem ser adicionados ao registro em tempo de execução sem alterar classes existentes.
3. Facilita o teste isolado de cada comportamento de comando e permite enriquecer a telemetria a cada instrução executada.

---

## ADR 03: Persistência Abstrata com Conformidade ao Princípio de Liskov

### Contexto
A especificação do desafio indica que persistência em banco de dados é um item adicional bem-vindo, embora não obrigatório.

### Decisão
Criei a interface abstrata ProbeRepository e duas implementações completas: InMemoryProbeRepository e SqliteProbeRepository.

### Justificativa
1. Permite alternar a persistência da aplicação entre memória e SQLite através de uma variável de ambiente (STORAGE_TYPE=sqlite ou STORAGE_TYPE=in_memory) sem alterar uma única linha de regra de negócio ou rota da API.
2. Demonstra a aplicação prática do Princípio da Substituição de Liskov (LSP), validado por testes unitários e de integração parametrizados.
3. O repositório em SQLite utiliza a biblioteca padrão sqlite3 executada de forma não bloqueante via asyncio.to_thread, mantendo alta vazão no servidor assíncrono.

---

## ADR 04: Estratégia de Interrupção Imediata e Preservação de Estado Seguro

### Contexto
A regra da missão declara: se uma sequência inválida for enviada, a sonda não deverá executar ela inteira e retornar uma resposta apropriada a seu critério.

### Decisão
Adotei a estratégia de interrupção preventiva no passo exato da violação com preservação do último estado seguro.

### Justificativa
1. Segurança operacional: a sonda nunca deve cair do planalto marciano. Antes de alterar suas coordenadas, o comando prevê a posição de destino e, caso ultrapasse a fronteira, aborta imediatamente.
2. Observabilidade para os operadores: a API responde com código HTTP 422 e um payload estruturado informando o índice do caractere que falhou, o comando causador e as coordenadas seguras mantidas no repositório.
3. Persistência do progresso anterior: comandos válidos que antecederam a falha são preservados no banco de dados e no histórico de telemetria.

---

## ADR 05: Estrutura Monorepo com PNPM Workspaces e Docker Compose

### Contexto
Desejava entregar uma experiência completa de engenheiro FullStack, unindo o backend robusto em Python com um frontend interativo em React e Vite.

### Decisão
Organizei o repositório como um monorepo com pnpm-workspace.yaml na raiz, separando claramente as pastas backend e frontend, orquestradas por um arquivo docker-compose.yml.

### Justificativa
1. Permite a qualquer avaliador da RD Station clonar o repositório e rodar o projeto completo com um único comando docker compose up.
2. Mantém scripts unificados de desenvolvimento, testes e checagem de tipos (lint) na raiz do projeto.
3. Configuração de proxy reverso no Vite e no Nginx, permitindo que a aplicação funcione em localhost:3000 comunicando-se com o backend em localhost:8000 sem problemas de CORS.
