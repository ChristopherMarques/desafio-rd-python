# Diretrizes e Boas Práticas de Segurança no Backend

Segurança em engenharia de software não deve ser uma camada adicionada ao final do desenvolvimento nem um obstáculo complexo e burocrático. Ela deve ser simples, pragmática e incorporada nativamente no design da aplicação.

Em conformidade com as regras do desafio da RD Station, implementamos mecanismos essenciais de proteção que asseguram estabilidade e resiliência sem introduzir complexidade desnecessária.

## 1. Cabeçalhos de Segurança HTTP (OWASP Secure Headers)

Toda resposta emitida pela API passa pelo SecurityHeadersMiddleware (app/core/security.py), aplicando cabeçalhos padronizados pelas diretrizes internacionais do OWASP:

* X-Content-Type-Options: nosniff
  Evita que navegadores tentem adivinhar o tipo de conteúdo (MIME sniffing), prevenindo ataques onde arquivos de texto ou imagens são interpretados como scripts executáveis.
* X-Frame-Options: DENY
  Bloqueia qualquer tentativa de embutir a API ou suas páginas em tags iframe ou frame, eliminando vulnerabilidades de Clickjacking.
* X-XSS-Protection: 1; mode=block
  Ativa o filtro de proteção contra Cross-Site Scripting refletido em navegadores legados.
* Strict-Transport-Security: max-age=31536000; includeSubDomains
  Informa ao cliente que o serviço exige comunicação estritamente criptografada via HTTPS por no mínimo um ano.
* Referrer-Policy: strict-origin-when-cross-origin
  Impede o vazamento de caminhos e parâmetros confidenciais da URL durante navegação para domínios externos.
* Permissions-Policy: camera=(), microphone=(), geolocation=()
  Desativa expressamente permissões de hardware no cliente, uma vez que uma API de controle de sondas não demanda acesso a sensores de mídia ou geolocalização do dispositivo do usuário.

## 2. Proteção Contra Esgotamento de Recursos e DoS

Aplicações públicas podem sofrer degradação acidental ou intencional quando recebem cargas de dados desproporcionais. Implementamos guardrails rígidos nos schemas de entrada via Pydantic v2 (app/schemas/probe.py):

* Limite de Dimensões da Malha: Os eixos x e y aceitam valores entre 1 e 1000. Isso impede requisições abusivas que solicitem matrizes astronômicas (como 1 bilhão por 1 bilhão), protegendo a memória do servidor contra alocações descontroladas.
* Limite de Sequência de Comandos: A string commands possui tamanho mínimo de 1 e máximo de 1000 caracteres. Isso evita ataques de negação de serviço por cadeias gigantescas de caracteres que prenderiam o loop de eventos processando milhões de iterações em uma única requisição.

## 3. Preservação de Estado Seguro e Blindagem Contra Quedas

A regra central do domínio da sonda estabelece que a máquina nunca deve cair do planalto marciano.

Para garantir essa invariante:
* O cálculo da coordenada seguinte ocorre em modo preview antes da mutação real.
* Se o destino ultrapassar as fronteiras da malha, a sonda não executa o passo proibido.
* O sistema salva no repositório o estado seguro conquistado até aquele instante e interrompe a cadeia com status HTTP 422, fornecendo feedback detalhado aos operadores sem corromper os dados armazenados.

## 4. Ocultação de Detalhes Internos em Respostas de Erro

Expor detalhes como caminhos de arquivos do servidor, versões internas de pacotes ou rastros completos de erro (stack traces) fornece munição valiosa para agentes mal-intencionados realizarem reconhecimento de ambiente.

* O FastAPI intercepta exceções não tratadas através de um handler global em app/main.py.
* Erros inesperados são logados internamente no servidor para fins de observabilidade pela equipe de engenharia.
* Para o cliente externo, a API retorna apenas uma mensagem neutra e padronizada em formato JSON com código HTTP 500, protegendo a topologia interna da infraestrutura.

## 5. Segurança no Ciclo de Vida do Contêiner Docker

Tanto o contêiner do backend quanto o do frontend seguem princípios de menor privilégio:

* No Dockerfile do backend, criamos um usuário dedicado sem privilégios de administrador (useradd -u 1000 appuser), executando a aplicação fora do escopo de root.
* No contêiner Nginx do frontend, arquivos estáticos são copiados em estágio multi-stage, garantindo que dependências de desenvolvimento do Node.js não acompanhem a imagem final de produção.
