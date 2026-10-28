"""Provedores de injeção de dependências do FastAPI (Princípio da Inversão de Dependência)."""

from typing import Annotated

from fastapi import Depends

from app.core.config import settings
from app.domain.commands.registry import CommandRegistry
from app.domain.repositories.probe_repository import ProbeRepository
from app.infrastructure.repositories.in_memory_probe_repository import (
    InMemoryProbeRepository,
)
from app.infrastructure.repositories.sqlite_probe_repository import (
    SqliteProbeRepository,
)
from app.use_cases.launch_probe import LaunchProbeUseCase
from app.use_cases.list_probes import GetProbeUseCase, ListProbesUseCase
from app.use_cases.move_probe import MoveProbeUseCase

# Instâncias singleton em runtime para o ciclo de vida da aplicação
_in_memory_repo = InMemoryProbeRepository()
_sqlite_repo: SqliteProbeRepository | None = None
_command_registry = CommandRegistry()


def get_command_registry() -> CommandRegistry:
    """Retorna a instância central de registro de comandos extensíveis."""
    return _command_registry


def get_probe_repository() -> ProbeRepository:
    """Provedor do repositório selecionado nas configurações da aplicação.

    Permite chavear transparentemente entre persistência volátil em memória
    e banco relacional SQLite sem modificar nenhum caso de uso ou rota.
    """
    global _sqlite_repo
    if settings.storage_type == "sqlite":
        if _sqlite_repo is None:
            _sqlite_repo = SqliteProbeRepository(db_path=settings.sqlite_db_path)
        return _sqlite_repo
    return _in_memory_repo


def get_launch_probe_use_case(
    repo: Annotated[ProbeRepository, Depends(get_probe_repository)],
) -> LaunchProbeUseCase:
    return LaunchProbeUseCase(repository=repo)


def get_move_probe_use_case(
    repo: Annotated[ProbeRepository, Depends(get_probe_repository)],
    registry: Annotated[CommandRegistry, Depends(get_command_registry)],
) -> MoveProbeUseCase:
    return MoveProbeUseCase(repository=repo, registry=registry)


def get_list_probes_use_case(
    repo: Annotated[ProbeRepository, Depends(get_probe_repository)],
) -> ListProbesUseCase:
    return ListProbesUseCase(repository=repo)


def get_single_probe_use_case(
    repo: Annotated[ProbeRepository, Depends(get_probe_repository)],
) -> GetProbeUseCase:
    return GetProbeUseCase(repository=repo)
