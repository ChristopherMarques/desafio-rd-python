"""Testes End-to-End (E2E) para as rotas da API HTTP FastAPI."""

from httpx import AsyncClient


async def test_health_check_endpoint(async_client: AsyncClient) -> None:
    response = await async_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


async def test_rd_station_complete_e2e_flow(async_client: AsyncClient) -> None:
    """Valida o fluxo completo ponta a ponta conforme as 3 etapas do teste da RD Station:

    Etapa 1: POST /probes com {"x": 5, "y": 5, "direction": "NORTH"}
    Etapa 2: POST /probes/{id}/move com {"commands": "MRM"}
    Etapa 3: GET /probes
    """
    # 1. Lançar sonda
    launch_res = await async_client.post(
        "/probes",
        json={"x": 5, "y": 5, "direction": "NORTH"},
    )
    assert launch_res.status_code == 201
    probe_data = launch_res.json()
    assert "id" in probe_data
    probe_id = probe_data["id"]
    assert probe_data["x"] == 0
    assert probe_data["y"] == 0
    assert probe_data["direction"] == "NORTH"

    # 2. Mover sonda com "MRM"
    move_res = await async_client.post(
        f"/probes/{probe_id}/move",
        json={"commands": "MRM"},
    )
    assert move_res.status_code == 200
    moved_data = move_res.json()
    assert moved_data["id"] == probe_id
    assert moved_data["x"] == 1
    assert moved_data["y"] == 1
    assert moved_data["direction"] == "EAST"

    # 3. Ver posição de todas as sondas
    list_res = await async_client.get("/probes")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert "probes" in list_data
    assert len(list_data["probes"]) == 1
    assert list_data["probes"][0]["id"] == probe_id
    assert list_data["probes"][0]["x"] == 1
    assert list_data["probes"][0]["y"] == 1
    assert list_data["probes"][0]["direction"] == "EAST"


async def test_api_versioned_routes_parity(async_client: AsyncClient) -> None:
    """Verifica paridade das rotas versionadas sob /api/v1/probes."""
    launch_res = await async_client.post(
        "/api/v1/probes",
        json={"x": 5, "y": 5, "direction": "EAST"},
    )
    assert launch_res.status_code == 201
    probe_id = launch_res.json()["id"]

    move_res = await async_client.post(
        f"/api/v1/probes/{probe_id}/move",
        json={"commands": "M"},
    )
    assert move_res.status_code == 200
    assert move_res.json()["x"] == 1

    list_res = await async_client.get("/api/v1/probes")
    assert list_res.status_code == 200
    assert any(p["id"] == probe_id for p in list_res.json()["probes"])


async def test_move_probe_flexible_payload_and_alias_routes(
    async_client: AsyncClient,
) -> None:
    """Valida resiliência a convenções alternativas: command no singular, listas e POST/PUT em /probes/{id}."""
    launch_res = await async_client.post(
        "/probes",
        json={"x": 5, "y": 5, "direction": "NORTH"},
    )
    assert launch_res.status_code == 201
    probe_id = launch_res.json()["id"]

    # 1. POST /probes/{id} direto com {"command": "M"} no singular
    res_alias_post = await async_client.post(
        f"/probes/{probe_id}",
        json={"command": "M"},
    )
    assert res_alias_post.status_code == 200
    assert res_alias_post.json()["y"] == 1

    # 2. PUT /probes/{id} com lista ["R", "M"]
    res_alias_put = await async_client.put(
        f"/probes/{probe_id}",
        json={"commands": ["R", "M"]},
    )
    assert res_alias_put.status_code == 200
    assert res_alias_put.json()["x"] == 1
    assert res_alias_put.json()["direction"] == "EAST"


async def test_move_probe_out_of_bounds_returns_422_with_safe_state(
    async_client: AsyncClient,
) -> None:
    """Garante que tentativa de queda retorna 422 com o último estado válido preservado."""
    launch_res = await async_client.post(
        "/probes",
        json={"x": 2, "y": 2, "direction": "NORTH"},
    )
    probe_id = launch_res.json()["id"]

    # Tentativa de avançar 4 vezes num planalto de altura 2
    move_res = await async_client.post(
        f"/probes/{probe_id}/move",
        json={"commands": "MMMM"},
    )
    assert move_res.status_code == 422
    err_data = move_res.json()["detail"]

    assert err_data["error_code"] == "PROBE_OUT_OF_BOUNDS"
    assert err_data["failed_at_step"] == 2
    assert err_data["failed_command"] == "M"
    assert err_data["last_safe_state"] == {
        "id": probe_id,
        "x": 0,
        "y": 2,
        "direction": "NORTH",
    }

    # Verifica se o endpoint de consulta reflete o estado seguro mantido
    detail_res = await async_client.get(f"/probes/{probe_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["x"] == 0
    assert detail["y"] == 2


async def test_move_probe_not_found(async_client: AsyncClient) -> None:
    move_res = await async_client.post(
        "/probes/inexistente-123/move",
        json={"commands": "M"},
    )
    assert move_res.status_code == 404
    assert move_res.json()["detail"]["error_code"] == "PROBE_NOT_FOUND"


async def test_launch_probe_invalid_dimensions(async_client: AsyncClient) -> None:
    res = await async_client.post(
        "/probes",
        json={"x": 0, "y": 5, "direction": "NORTH"},
    )
    # Validação do Pydantic (ge=1) retorna 422
    assert res.status_code == 422


async def test_launch_probe_invalid_direction(async_client: AsyncClient) -> None:
    res = await async_client.post(
        "/probes",
        json={"x": 5, "y": 5, "direction": "NORTHEAST"},
    )
    assert res.status_code == 422


async def test_owasp_security_headers_present(async_client: AsyncClient) -> None:
    """Verifica se os cabeçalhos de endurecimento e segurança OWASP estão ativos."""
    res = await async_client.get("/health")
    assert res.status_code == 200
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert res.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "max-age=31536000" in res.headers.get("Strict-Transport-Security", "")
    assert res.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


async def test_security_input_guardrails_prevent_dos(async_client: AsyncClient) -> None:
    """Garante que payloads gigantes para esgotamento de recursos são barrados no schema."""
    # Dimensões excessivas
    res_dim = await async_client.post(
        "/probes",
        json={"x": 99999, "y": 5, "direction": "NORTH"},
    )
    assert res_dim.status_code == 422

    # Sequência de comandos abusiva (> 1000 caracteres)
    launch_res = await async_client.post(
        "/probes",
        json={"x": 5, "y": 5, "direction": "NORTH"},
    )
    probe_id = launch_res.json()["id"]

    res_huge = await async_client.post(
        f"/probes/{probe_id}/move",
        json={"commands": "M" * 1005},
    )
    assert res_huge.status_code == 422
