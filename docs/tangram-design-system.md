# Design System Tangram e Interface Feita à Mão

Para demonstrar afinidade com o ecossistema e com a cultura visual da RD Station, construímos a camada de apresentação frontend inspirada no Design System Tangram (tangram.rdstation.com.br), combinando seus princípios visuais com a biblioteca Rough.js (roughjs.com) para gerar uma estética única de caderneta de campo e blueprint de exploração espacial.

## Conceito Visual: Tangram Sketch

O Tangram tem como essência modularidade, solidez geométrica e clareza funcional. No contexto da missão da sonda marciana, unimos essa solidez ao charme dos gráficos feitos à mão com traços de esboço (sketchy look):

1. Tokens Oficiais da RD Station: Replicamos a paleta cromática nos arquivos de configuração do Tailwind e componentes React:
   * RD Blue (#0073FF): Cor primária de destaque, acionamento de ações principais e halos de seleção.
   * RD Navy (#19212C, #0C111A): Superfícies de fundo em modo escuro de alto contraste, conferindo uma atmosfera imersiva de centro de comando aeroespacial.
   * RD Orange (#F25C05): Cor de alerta e marcação de fronteiras críticas do planalto.
   * RD Teal (#00B37E): Indicadores de sucesso, telemetria geodésica e base de pouso inicial (0, 0).
   * Golden Yellow (#FFB800): Painéis solares fotovoltaicos da sonda e elementos auxiliares.
2. Gráficos com Rough.js: Em vez de renderizar simples vetores estáticos, utilizamos o motor do Rough.js no componente PlateauCanvas para desenhar em tempo real:
   * As linhas da malha com pequenas variações de curvatura e rugosidade, simulando o papel milimetrado de um engenheiro.
   * Crateras marcianas com preenchimento em hachuras orgânicas.
   * O sprite procedural do Mars Rover, composto por chassi com hachura a quarenta e cinco graus, seis rodas rocker-bogie, mastro com câmara panorâmica e faróis de projeção de direção.
   * Rastro pontilhado conectando todas as posições anteriores navegadas pela sonda selecionada.

## Componentes Criados com Padrão Shadcn UI

Adotamos a filosofia do shadcn UI, onde os componentes não são uma dependência pesada de pacote fechado, mas sim código limpo, acessível e modular mantido diretamente dentro da base do projeto:

* Button (src/components/ui/Button.tsx): Suporta variantes primária (RD Blue), secundária, laranja, verde-água e perigo, com efeito táctil de relevo mecânico e sombras sketch.
* Card (src/components/ui/Card.tsx): Painéis organizadores com bordas refinadas e efeitos suaves de iluminação atmosférica para telemetria.
* Badge (src/components/ui/Badge.tsx): Tags de estado com cores semânticas para exibição de orientações e contadores.
* Input (src/components/ui/Input.tsx): Campo de entrada textual estilizado com tipografia monoespaçada (JetBrains Mono) e anel de foco calibrado na cor RD Blue.
* Dialog (src/components/ui/Dialog.tsx): Modal acessível com suporte a fechamento por tecla Escape e clique no backdrop escurecido para lançamento de novas sondas.

## O Jogo e Simulador Interativo: Mission Control

A interface não é apenas um formulário de envio, mas uma aplicação interativa completa:

* Controle Imediato via Teclado e D-Pad: O operador pode usar as teclas W, A e D ou as setas direcionais para movimentar ou rotacionar a sonda com feedback instantâneo.
* Execução em Lote e Modo Passo a Passo: Permite digitar sequências como "MRM" ou "LMLMLMLMM" e executá-las de uma só vez via API, ou acionar o botão "Simular" para assistir a sonda avançando e girando passo a passo na tela.
* Efeitos Sonoros com Web Audio API (src/lib/sound.ts): Para enriquecer a experiência sem depender de arquivos de áudio externos ou conexões lentas, sintetizamos frequências de rádio da NASA, ruídos mecânicos de rotação de servo-motores e bips de aviso diretamente através do oscilador nativo do navegador.
* Painel de Telemetria com Bússola Dinâmica: Apresenta as coordenadas atuais, a porcentagem de área explorada e uma bússola cuja agulha gira suavemente conforme a sonda muda de orientação.
* Modo Offline e Resiliência: Caso o backend esteja em processo de inicialização, a interface conta com um simulador local integrado em memória, permitindo explorar a aplicação mesmo sem conexão imediata com o servidor.
