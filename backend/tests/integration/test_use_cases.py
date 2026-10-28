"""Testes de integração para os Casos de Uso com repositório e registry."""

import pytest

from app.core.exceptions import (
    InvalidCommandException,
    ProbeOutOfBoundsException,
)
from app.domain.commands.registry import CommandRegistry
from app.domain.models.direction import Direction
from app.infrastructure.repositories.in_memory_probe_repository import (
    InMemoryProbeRepository,
)
from app.use_cases.launch_probe import LaunchProbeUseCase
from app.use_cases.list_probes import ListProbesUseCase
from app.use_cases.move_probe import MoveProbeUseCase


@pytest.fixture
def repository() -> InMemoryProbeRepository:
    return InMemoryProbeRepository()


@pytest.fixture
def registry() -> CommandRegistry:
    return CommandRegistry()


async def test_rd_station_spec_scenario(
    repository: InMemoryProbeRepository, registry: CommandRegistry
) -> None:
    """Cenário exato especificado no Desafio Técnico RD Station:

    1. Lançar sonda com malha 5x5 e direção NORTH -> Posição inicial (0, 0, NORTH).
    2. Enviar comandos 'MRM' -> Posição final (1, 1, EAST).
    """
    launch_uc = LaunchProbeUseCase(repository=repository)
    move_uc = MoveProbeUseCase(repository=repository, registry=registry)

    # 1. Lança a sonda
    probe = await launch_uc.execute(max_x=5, max_y=5, direction=Direction.NORTH, custom_id="abc123")
    assert probe.id == "abc123"
    assert probe.coordinates.x == 0
    assert probe.coordinates.y == 0
    assert probe.direction == Direction.NORTH

    # 2. Executa sequência "MRM"
    moved_probe = await move_uc.execute(probe_id="abc123", commands="MRM")
    assert moved_probe.coordinates.x == 1
    assert moved_probe.coordinates.y == 1
    assert moved_probe.direction == Direction.EAST


async def test_move_probe_aborts_before_falling_off_plateau(
    repository: InMemoryProbeRepository, registry: CommandRegistry
) -> None:
    """A sonda nunca deve cair do planalto:

    Tentativa de ultrapassar a fronteira superior norte (limite Y=5)
    com sequência 'MMMMMM' (6 avanços a partir de Y=0).
    Deve executar 5 passos e falhar no 6º passo (índice 5),
    preservando o estado seguro em (0, 5, NORTH).
    """
    launch_uc = LaunchProbeUseCase(repository=repository)
    move_uc = MoveProbeUseCase(repository=repository, registry=registry)

    probe = await launch_uc.execute(max_x=5, max_y=5, direction=Direction.NORTH, custom_id="rover-edge")

    with pytest.raises(ProbeOutOfBoundsException) as exc_info:
        await move_uc.execute(probe_id=probe.id, commands="MMMMMM")

    err = exc_info.value
    assert err.step_index == 5
    assert err.failed_command == "M"
    assert err.attempted_y == 6

    # Verifica se o repositório manteve a sonda salva no último estado seguro
    saved_probe = await repository.get_by_id(probe.id)
    assert saved_probe is not None
    assert saved_probe.coordinates.x == 0
    assert saved_probe.coordinates.y == 5
    assert saved_probe.direction == Direction.NORTH


async def test_move_probe_aborts_on_invalid_command_character(
    repository: InMemoryProbeRepository, registry: CommandRegistry
) -> None:
    """Comandos inválidos não devem ser executados e devem parar a sequência."""
    launch_uc = LaunchProbeUseCase(repository=repository)
    move_uc = MoveProbeUseCase(repository=repository, registry=registry)

    probe = await launch_uc.execute(max_x=5, max_y=5, direction=Direction.NORTH, custom_id="rover-bad-cmd")

    # Sequência com 'X' inválido no índice 1
    with pytest.raises(InvalidCommandException) as exc_info:
        await move_uc.execute(probe_id=probe.id, commands="MXM")

    assert exc_info.value.command == "X"
    assert exc_info.value.index == 1

    # O primeiro comando 'M' foi executado antes do comando 'X' inválido
    saved_probe = await repository.get_by_id(probe.id)
    assert saved_probe is not None
    assert saved_probe.coordinates.x == 0
    assert saved_probe.coordinates.y == 1


async def test_multiple_probes_lifecycle_and_listing(
    repository: InMemoryProbeRepository, registry: CommandRegistry
) -> None:
    """Valida o ciclo de vida completo de múltiplas sondas simultâneas."""
    launch_uc = LaunchProbeUseCase(repository=repository)
    move_uc = MoveProbeUseCase(repository=repository, registry=registry)
    list_uc = ListProbesUseCase(repository=repository)

    # Lança sonda 1 e move
    p1 = await launch_uc.execute(max_x=5, max_y=5, direction=Direction.NORTH, custom_id="sonda-1")
    await move_uc.execute(probe_id=p1.id, commands="MRM")

    # Lança sonda 2 e move
    p2 = await launch_uc.execute(max_x=5, max_y=5, direction=Direction.EAST, custom_id="sonda-2")
    await move_uc.execute(probe_id=p2.id, commands="MMML")

    # Lista todas as sondas
    all_probes = await list_uc.execute()
    assert len(all_probes) == 2

    probes_map = {p.id: p for p in all_probes}
    assert probes_map["sonda-1"].to_state_dict() == {
        "id": "sonda-1",
        "x": 1,
        "y": 1,
        "direction": "EAST",
    }
    assert probes_map["sonda-2"].to_state_dict() == {
        "id": "sonda-2",
        "x": 3,
        "y": 0,
        "direction": "NORTH",
    }
