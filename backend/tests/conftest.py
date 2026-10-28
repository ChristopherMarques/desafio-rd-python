"""Configurações e fixtures para suítes de testes com pytest."""

import sys
from collections.abc import AsyncGenerator
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

# Garante que o diretório backend esteja no PYTHONPATH
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.api.dependencies import get_probe_repository  # noqa: E402
from app.domain.commands.registry import CommandRegistry  # noqa: E402
from app.infrastructure.repositories.in_memory_probe_repository import (  # noqa: E402
    InMemoryProbeRepository,
)
from app.main import app  # noqa: E402


@pytest.fixture
def in_memory_repo() -> InMemoryProbeRepository:
    """Fixture que fornece um repositório limpo em memória."""
    return InMemoryProbeRepository()


@pytest.fixture
def command_registry() -> CommandRegistry:
    """Fixture que fornece um registro de comandos com as instruções padrão."""
    return CommandRegistry()


@pytest.fixture
async def async_client(
    in_memory_repo: InMemoryProbeRepository,
) -> AsyncGenerator[AsyncClient, None]:
    """Cliente HTTP assíncrono para testes E2E com injeção isolada de repositório."""
    app.dependency_overrides[get_probe_repository] = lambda: in_memory_repo

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client

    app.dependency_overrides.clear()
