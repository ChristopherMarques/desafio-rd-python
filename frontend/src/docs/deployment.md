# Guia de Deploy Contínuo no Coolify via GHCR

Estruturei o pipeline de entrega contínua deste projeto seguindo o mesmo padrão de excelência e confiabilidade que utilizo em produção no ecossistema Inspirare Digital: o GitHub Actions compila as imagens Docker multi-stage, publica os pacotes no GitHub Container Registry (GHCR) e o Coolify na minha VPS Linux apenas consome as imagens prontas, executando deploys sem downtime e sem sobrecarregar a CPU do servidor.

## Visão Geral da Arquitetura de Deploy

1. O desenvolvedor realiza o merge do Pull Request na branch main.
2. A pipeline automatizada do GitHub Actions (.github/workflows/publish-ghcr.yml) é disparada.
3. As imagens do backend e frontend são compiladas com cache distribuído e publicadas no GHCR:
   * ghcr.io/christophermarques/desafio-rd-backend:latest
   * ghcr.io/christophermarques/desafio-rd-frontend:latest
4. Ao concluir o envio com sucesso, a Action dispara um webhook seguro do Coolify.
5. O Coolify executa o pull das novas imagens e recria os contêineres graciosamente sob o proxy reverso com certificado SSL automático.

## Passo a Passo para Configurar no Coolify

### 1. Criar o Recurso Docker Compose no Coolify

1. No painel do Coolify na VPS, acesse o seu Projeto ou crie um novo chamado Desafio RD Station.
2. Clique em New Resource e selecione Docker Compose.
3. Cole a configuração de produção contida no arquivo docker-compose.prod.yml da raiz do projeto:

```yaml
services:
  backend:
    image: ghcr.io/christophermarques/desafio-rd-backend:latest
    container_name: mars-probe-backend-prod
    environment:
      - ENVIRONMENT=production
      - STORAGE_TYPE=sqlite
      - SQLITE_DB_PATH=/app/data/mars_probes.db
      - DEBUG=false
    volumes:
      - mars_probe_data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 5s

  frontend:
    image: ghcr.io/christophermarques/desafio-rd-frontend:latest
    container_name: mars-probe-frontend-prod
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

volumes:
  mars_probe_data:
    name: mars_probe_data
```

### 2. Configurar o Domínio Público

No Coolify, na aba de configurações do serviço frontend, defina o domínio público desejado (por exemplo, https://desafio-rd.seudominio.com).

Como configurei o contêiner do frontend com Nginx atuando como proxy reverso interno:
* O Nginx entrega a Single Page Application React na raiz /.
* Todas as chamadas para /probes e /api/ são encaminhadas internamente pela rede do Docker para http://backend:8000.
* Isso significa que você precisa apontar apenas um único domínio no Coolify, eliminando qualquer problema de CORS em produção e mantendo a arquitetura simples e segura.

Se desejar disponibilizar também o Swagger diretamente em um subdomínio de API (por exemplo, https://api-desafio-rd.seudominio.com), basta adicionar o domínio nas configurações do serviço backend no Coolify apontando para a porta 8000.

### 3. Autenticação no GHCR caso o repositório seja privado

Se os pacotes no GHCR estiverem marcados como privados:
1. No Coolify, vá em Sources e adicione suas credenciais do GitHub (ou um Personal Access Token com permissão read:packages).
2. Se o repositório for público, o Coolify baixa as imagens do GHCR diretamente sem necessidade de autenticação.

### 4. Automatizar o Disparo via Webhook

1. No Coolify, dentro da aplicação criada, vá na aba Webhooks e copie a URL do Deploy Webhook.
2. No repositório do GitHub, acesse Settings > Secrets and variables > Actions.
3. Crie uma nova secret com o nome COOLIFY_WEBHOOK e cole a URL fornecida pelo Coolify.
4. Pronto. A cada push ou merge na branch main, as imagens serão geradas no GHCR e o Coolify fará o deploy automático.
