# Arquitetura e Decisões de Engenharia

Este documento tem o objetivo de detalhar as escolhas arquiteturais do projeto de exploração de Marte, concebido para demonstrar alto rigor técnico, manutenibilidade e clareza de código para o time de engenharia da RD Station.

## Filosofia Central do Projeto

Seguimos à risca o princípio compartilhado pela engenharia da RD Station: projete seu código para ser mais fácil de entender, não mais fácil de escrever. 

Em sistemas distribuídos e de missão crítica, a legibilidade e a previsibilidade superam qualquer atalho de sintaxe ou metaprogramação excessiva. Por essa razão, evitamos frameworks excessivamente opinativos ou mágicos e optamos por uma estrutura desacoplada baseada em Clean Architecture e Domain-Driven Design (DDD).

## Por que FastAPI e não Django para este desafio?

Ao avaliar o cenário proposto pela RD Station, consideramos tanto Django quanto FastAPI. A escolha pelo FastAPI foi pautada por critérios técnicos claros:

1. Ausência de acoplamento com banco relacional: O desafio avalia regras de navegação pura, validação de coordenadas e orientação espacial. Django traz consigo um ORM pesado, tabelas de autenticação, sessões e rotinas administrativas que adicionariam complexidade desnecessária para um microsserviço enxuto.
2. Tipagem estática forte e documentação viva: O FastAPI é construído nativamente sobre o Pydantic v2 e type hints modernos do Python. Isso gera automaticamente documentação interativa OpenAPI e Swagger em /docs e Redoc em /redoc, facilitando a validação imediata por qualquer desenvolvedor ou avaliador.
3. Desacoplamento da camada de domínio: Com FastAPI, nossas entidades de domínio e casos de uso permanecem como código Python puro, sem nenhuma dependência do framework web. Se no futuro a aplicação precisar ser acionada por uma fila Kafka, uma CLI de terminal ou um bot de mensageria, o núcleo de domínio permanece intacto.
4. Desempenho assíncrono nativo: O suporte de primeira classe a async e await permite alta concorrência com baixo consumo de memória, padrão ideal para microsserviços modernos.

## Camadas da Aplicação

O backend foi estruturado em quatro camadas bem delimitadas, onde as dependências apontam estritamente de fora para dentro:

### 1. Camada de Domínio (app/domain)
É o coração do sistema, contendo as regras de negócio puras que existem independentemente de qualquer protocolo de rede ou banco de dados.

* Models e Value Objects: 
  * Coordinates: Value Object imutável que encapsula a posição cartesiana (x, y) e fornece métodos para cálculo de translação vetorial.
  * Direction: Enumeração cardinal com métodos para rotações de 90 graus à esquerda e à direita, além do mapeamento para vetores de deslocamento.
  * Plateau: Entidade responsável por conhecer suas dimensões máximas e validar se uma determinada coordenada reside dentro de suas fronteiras navegáveis.
  * Probe: Aggregate Root que encapsula o identificador da sonda, sua posição atual, orientação, associação ao planalto e histórico de telemetria.
* Commands (Padrão de Projeto Command):
  * Command: Interface que define a execução de uma instrução.
  * MoveForwardCommand: Executa o avanço de um quadrante na direção atual, checando antecipadamente se a nova posição violará os limites do planalto.
  * TurnLeftCommand e TurnRightCommand: Executam giros de noventa graus sem alterar as coordenadas espaciais.
  * CommandRegistry: Registro centralizado que converte símbolos como M, L e R em instâncias executáveis, viabilizando o princípio Aberto e Fechado (OCP).
* Repositories (Interfaces):
  * ProbeReader, ProbeWriter e ProbeRepository: Contratos abstratos utilizando protocolos do Python para operações de persistência e consulta.

### 2. Camada de Casos de Uso (app/use_cases)
Orquestra as ações do sistema executando regras de negócio através de interfaces:

* LaunchProbeUseCase: Recebe as dimensões máximas da malha e a direção inicial, instancia o planalto e a sonda na coordenada base (0, 0), persistindo o estado inicial no repositório.
* MoveProbeUseCase: Recebe o identificador da sonda e a cadeia de comandos. Itera sobre cada instrução, consultando o CommandRegistry e executando a ação. Caso ocorra uma tentativa de queda da malha ou um caractere desconhecido, interrompe imediatamente a execução, salva o último estado seguro no repositório e lança uma exceção rica em detalhes.
* ListProbesUseCase e GetProbeUseCase: Consultam as sondas registradas e seus dados de telemetria.

### 3. Camada de Infraestrutura (app/infrastructure)
Contém os adaptadores que implementam as interfaces de persistência definidas no domínio:

* InMemoryProbeRepository: Armazenamento em memória rápido e protegido por travas assíncronas (asyncio.Lock), perfeito para suítes de testes automatizados e execuções voláteis.
* SqliteProbeRepository: Implementação durável em banco relacional SQLite local, utilizando a biblioteca padrão e executando operações de entrada e saída em threads dedicadas (asyncio.to_thread) para não bloquear o loop de eventos.

### 4. Camada de Apresentação e API HTTP (app/api)
Responsável por expor a interface REST, validar contratos de entrada com Pydantic e tratar códigos de status HTTP:

* FastAPI Routers: Mapeados tanto nas rotas raiz (/probes) quanto nas rotas versionadas (/api/v1/probes).
* Injeção de Dependências (Depends): Provedores em app/api/dependencies.py injetam repositórios e casos de uso nas rotas de forma desacoplada, facilitando a substituição por mocks durante testes automatizados.

## Interrupção Segura em Caso de Sequências Inválidas

Um dos requisitos mais importantes do desafio é o tratamento de sequências de comando que levariam a sonda a sair dos limites do planalto ou que contenham caracteres inválidos.

Nossa arquitetura implementa uma estratégia de interrupção segura:

1. Antes de mover a sonda para uma nova posição, o comando calcula a coordenada de destino de forma antecipada (preview).
2. Se a coordenada violar as fronteiras do planalto (x menor que zero, x maior que o limite horizontal, y menor que zero ou y maior que o limite vertical), a sonda não realiza o movimento perigoso.
3. O caso de uso intercepta o evento, persiste no repositório a posição segura alcançada até aquele instante e lança a exceção ProbeOutOfBoundsException.
4. A API responde com o código HTTP 422 (Unprocessable Content) e envia um JSON detalhado informando o passo exato da falha, o comando que causou o bloqueio e o último estado seguro intacto da sonda.
