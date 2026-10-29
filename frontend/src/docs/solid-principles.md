# Aplicação Prática dos Princípios SOLID

Conduzi a engenharia deste projeto guiado rigorosamente pelos cinco princípios do SOLID, garantindo código sustentável, de baixo acoplamento e alta coesão. Abaixo demonstro como apliquei cada princípio no código-fonte.

## 1. Single Responsibility Principle (Princípio da Responsabilidade Única)

Modelei cada classe e módulo para possuir uma única razão para mudar.

* Plateau (app/domain/models/plateau.py): Sua única responsabilidade é conhecer a extensão do terreno e validar se um par de coordenadas está contido dentro dos limites do planalto. O planalto não conhece a sonda e não sabe como ela se move.
* Coordinates (app/domain/models/coordinates.py): Projetei como um Value Object imutável focado apenas em representar um ponto bidimensional e calcular translações vetoriais puras.
* Direction (app/domain/models/direction.py): Responsável unicamente pelas relações de orientação cardinal e cálculo trigonométrico dos giros em noventa graus.
* Probe (app/domain/models/probe.py): É a entidade raiz que mantém a consistência do estado da sonda, delegando cálculos matemáticos às coordenadas e orientações.
* Use Cases (app/use_cases): Cada caso de uso que desenvolvi (LaunchProbeUseCase, MoveProbeUseCase, ListProbesUseCase) trata exclusivamente de uma única intenção de negócio do sistema.

## 2. Open/Closed Principle (Princípio Aberto e Fechado)

As entidades do sistema devem estar abertas para extensão, mas fechadas para modificação.

Apliquei este princípio com clareza na implementação dos comandos de movimentação (app/domain/commands). Em vez de utilizar uma série de instruções condicionais com if ou switch para verificar os caracteres dos comandos, empreguei o Padrão de Projeto Command aliado ao CommandRegistry:

* A interface Command define o contrato de qualquer ação executável.
* MoveForwardCommand, TurnLeftCommand e TurnRightCommand são implementações independentes que criei.
* O CommandRegistry registra e mapeia símbolos aos seus respectivos comandos.

Se uma nova missão da RD Station exigir a criação do comando U para meia-volta de 180 graus, B para marcha a ré ou S para leitura geológica do solo, basta criar uma nova classe que implemente a interface Command e registrá-la no CommandRegistry. Nenhuma linha de código da sonda, dos casos de uso ou das rotas da API precisa ser alterada.

Escrevi inclusive um teste unitário dedicado (test_command_registry_extensibility_ocp em backend/tests/unit/test_commands.py) onde comprovo essa extensibilidade sem modificar o núcleo da aplicação.

## 3. Liskov Substitution Principle (Princípio da Substituição de Liskov)

Subtipos devem poder substituir seus tipos base sem quebrar o comportamento esperado do programa.

No projeto, estruturei a persistência de sondas sob o contrato abstrato ProbeRepository (app/domain/repositories/probe_repository.py). Implementei duas estratégias completas de persistência:

1. InMemoryProbeRepository: Armazena o estado em memória com isolamento de locks assíncronos.
2. SqliteProbeRepository: Armazena o estado de forma durável em um banco de dados SQLite local.

Construí ambas as implementações respeitando rigorosamente a mesma semântica, as mesmas assinaturas e o mesmo tratamento de exceções. Qualquer caso de uso ou rota da API funciona de forma idêntica tanto com o repositório em memória quanto com o banco relacional em disco.

A conformidade com Liskov é validada de forma automatizada através do teste parametrizado backend/tests/integration/test_repositories.py que escrevi, submetendo ambas as classes à mesma suíte de verificações de ciclo de vida.

## 4. Interface Segregation Principle (Princípio da Segregação de Interfaces)

Clientes não devem ser forçados a depender de métodos que não utilizam.

Em vez de criar uma interface de repositório monolítica e sobrecarregada, segreguei as operações em protocolos coesos (app/domain/repositories/probe_repository.py):

* ProbeReader: Contém apenas operações de consulta (get_by_id, list_all e exists).
* ProbeWriter: Contém apenas operações de mutação (save e delete).
* ProbeRepository: Interface composta que une as duas facetas para consumidores que necessitam de leitura e escrita simultâneas.

Essa divisão permite que serviços que apenas consultam relatórios de sondas dependam unicamente do ProbeReader, reduzindo o acoplamento e blindando a camada de leitura contra mutações indevidas.

## 5. Dependency Inversion Principle (Princípio da Inversão de Dependência)

Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.

Em minha arquitetura, os módulos de alto nível (os casos de uso e os controladores HTTP do FastAPI) nunca instanciam diretamente classes concretas de banco de dados ou adaptadores de infraestrutura:

* O MoveProbeUseCase recebe via injeção de dependência o contrato abstrato ProbeRepository e a classe CommandRegistry. Ele não depende de onde os dados são gravados (memória, SQLite ou PostgreSQL).
* As rotas do FastAPI utilizam a injeção nativa via Depends (que configurei em app/api/dependencies.py) para receber os casos de uso já parametrizados.

Essa inversão permite que a aplicação seja testada com velocidade extraordinária em suítes de testes unitários e de integração, pois injeto repositórios simulados sem a necessidade de recursos de rede ou bancos de dados reais.
