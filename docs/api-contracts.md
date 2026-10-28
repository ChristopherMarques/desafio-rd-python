# Especificação dos Contratos de API

A API foi desenvolvida em conformidade estrita com o documento de requisitos do Desafio Técnico da RD Station, disponibilizando endpoints RESTful com payloads JSON tipados e validação automática via Pydantic v2.

Para conveniência de avaliação, todas as rotas estão disponíveis tanto no caminho raiz especificado no desafio (por exemplo, /probes) quanto no prefixo versionado (/api/v1/probes).

## 1. Lançar Sonda e Configurar Malha

* Método: POST
* Rota: /probes ou /api/v1/probes
* Código de Sucesso: 201 Created

### Descrição do Comportamento
Este endpoint recebe as dimensões do canto superior direito do planalto marciano e a orientação inicial da sonda. A sonda sempre inicia sua missão no quadrante inicial (0, 0), no canto inferior esquerdo da malha. O sistema gera e retorna um identificador único para ser utilizado nas requisições seguintes.

### Payload de Entrada
```json
{
  "x": 5,
  "y": 5,
  "direction": "NORTH"
}
```

### Resposta de Sucesso (201 Created)
```json
{
  "id": "prb-8a1f2b",
  "x": 0,
  "y": 0,
  "direction": "NORTH"
}
```

### Erros Possíveis
* 400 Bad Request: Lançado caso as coordenadas máximas x ou y sejam menores que um.
* 422 Unprocessable Content: Lançado caso a direção enviada não pertença aos valores permitidos (NORTH, EAST, SOUTH, WEST).

---

## 2. Mover Sonda

* Método: POST
* Rota: /probes/{id}/move ou /api/v1/probes/{id}/move
* Código de Sucesso: 200 OK

### Descrição do Comportamento
Recebe uma cadeia de comandos contendo instruções de movimentação e rotação:
* M: Move a sonda um espaço à frente na direção para a qual ela está virada.
* L: Gira a sonda noventa graus à esquerda no sentido anti-horário sem alterar sua posição cartesiana.
* R: Gira a sonda noventa graus à direita no sentido horário sem alterar sua posição cartesiana.

### Payload de Entrada
```json
{
  "commands": "MRM"
}
```

### Resposta de Sucesso (200 OK)
Considerando a sonda de exemplo acima iniciando em (0, 0, NORTH) e recebendo "MRM", a sonda avança para (0, 1, NORTH), vira para o leste (0, 1, EAST) e avança para (1, 1, EAST):
```json
{
  "id": "prb-8a1f2b",
  "x": 1,
  "y": 1,
  "direction": "EAST"
}
```

### Tratamento de Falhas e Interrupção Segura (422 Unprocessable Content)
Conforme exigido nas regras da RD Station, se uma sequência inválida for enviada ou se um movimento for levar a sonda a sair dos limites da malha (cair do planalto), a sonda não deve executar a sequência inteira. Ela é interrompida com segurança no último estado válido antes da falha.

Exemplo de resposta quando uma sonda em (0, 5, NORTH) em um planalto de altura 5 tenta mover para frente:
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

Se um caractere não reconhecido for submetido (por exemplo, "MXM"):
```json
{
  "detail": {
    "detail": "Comando 'X' inválido no índice 1. Comandos aceitos: M (mover), L (virar à esquerda), R (virar à direita).",
    "error_code": "INVALID_COMMAND",
    "failed_at_step": 1,
    "failed_command": "X",
    "last_safe_state": null
  }
}
```

Se a sonda com o ID informado não existir no repositório:
* Código HTTP: 404 Not Found

---

## 3. Ver Posição de Todas as Sondas

* Método: GET
* Rota: /probes ou /api/v1/probes
* Código de Sucesso: 200 OK

### Descrição do Comportamento
Retorna o estado e a posição atualizada de todas as sondas enviadas em missão que estão registradas no repositório.

### Resposta de Sucesso (200 OK)
```json
{
  "probes": [
    {
      "id": "prb-8a1f2b",
      "x": 1,
      "y": 1,
      "direction": "EAST"
    },
    {
      "id": "prb-9c3d4e",
      "x": 3,
      "y": 4,
      "direction": "NORTH"
    }
  ]
}
```

---

## 4. Detalhes Estendidos e Telemetria da Sonda

* Método: GET
* Rota: /probes/{id} ou /api/v1/probes/{id}
* Código de Sucesso: 200 OK

### Descrição do Comportamento
Endpoint adicional desenvolvido para apoiar a interface visual do painel de missão, retornando as dimensões originais do planalto e a lista completa do rastro percorrido pela sonda (path history) desde o momento do pouso.

### Resposta de Sucesso (200 OK)
```json
{
  "id": "prb-8a1f2b",
  "x": 1,
  "y": 1,
  "direction": "EAST",
  "plateau_max_x": 5,
  "plateau_max_y": 5,
  "path_history": [
    { "x": 0, "y": 0, "direction": "NORTH", "action": "LANDING" },
    { "x": 0, "y": 1, "direction": "NORTH", "action": "MOVE" },
    { "x": 0, "y": 1, "direction": "EAST", "action": "TURN_RIGHT" },
    { "x": 1, "y": 1, "direction": "EAST", "action": "MOVE" }
  ]
}
```
