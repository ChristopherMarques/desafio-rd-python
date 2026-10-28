"""Testes de conformidade do Princípio da Substituição de Liskov (LSP) para repositórios."""

import tempfile
from pathlib import Path

import pytest

from app.domain.models.coordinates import Coordinates
from app.domain.models.direction import Direction
from app.domain.models.plateau import Plateau
from app.domain.models.probe import Probe
from app.domain.repositories.probe_repository import ProbeRepository
from app.infrastructure.repositories.in_memory_probe_repository import (
    InMemoryProbeRepository,
)
from app.infrastructure.repositories.sqlite_probe_repository import (
    SqliteProbeRepository,
)


@pytest.fixture(
    params=["in_memory", "sqlite"],
    ids=["InMemoryProbeRepository", "SqliteProbeRepository"],
)
def repository(request: pytest.FixtureRequest) -> ProbeRepository:
    """Parametrized fixture que roda os mesmos testes contra ambas as implementações."""
    if request.param == "in_memory":
        return InMemoryProbeRepository()
    elif request.param == "sqlite":
        temp_dir = tempfile.mkdtemp()
        db_path = str(Path(temp_dir) / "test_probes.db")
        return SqliteProbeRepository(db_path=db_path)
    raise ValueError(f"Tipo desconhecido: {request.param}")


async def test_repository_save_and_get_by_id(repository: ProbeRepository) -> None:
    probe = Probe(
        id="lsp-test-1",
        plateau=Plateau(5, 5),
        coordinates=Coordinates(2, 3),
        direction=Direction.WEST,
    )
    await repository.save(probe)

    retrieved = await repository.get_by_id("lsp-test-1")
    assert retrieved is not None
    assert retrieved.id == "lsp-test-1"
    assert retrieved.coordinates == Coordinates(2, 3)
    assert retrieved.direction == Direction.WEST
    assert retrieved.plateau == Plateau(5, 5)


async def test_repository_update_existing_probe(repository: ProbeRepository) -> None:
    probe = Probe(
        id="lsp-test-2",
        plateau=Plateau(10, 10),
        coordinates=Coordinates(0, 0),
        direction=Direction.NORTH,
    )
    await repository.save(probe)

    probe.turn_right()
    probe.move_to(Coordinates(1, 0))
    await repository.save(probe)

    updated = await repository.get_by_id("lsp-test-2")
    assert updated is not None
    assert updated.coordinates == Coordinates(1, 0)
    assert updated.direction == Direction.EAST


async def test_repository_list_all_and_exists(repository: ProbeRepository) -> None:
    p1 = Probe(id="p-1", plateau=Plateau(5, 5), direction=Direction.NORTH)
    p2 = Probe(id="p-2", plateau=Plateau(5, 5), direction=Direction.SOUTH)

    await repository.save(p1)
    await repository.save(p2)

    assert await repository.exists("p-1") is True
    assert await repository.exists("p-2") is True
    assert await repository.exists("p-nonexistent") is False

    all_probes = await repository.list_all()
    assert len(all_probes) == 2
    ids = {p.id for p in all_probes}
    assert ids == {"p-1", "p-2"}


async def test_repository_delete(repository: ProbeRepository) -> None:
    probe = Probe(id="p-del", plateau=Plateau(5, 5), direction=Direction.NORTH)
    await repository.save(probe)

    deleted = await repository.delete("p-del")
    assert deleted is True
    assert await repository.get_by_id("p-del") is None
    assert await repository.exists("p-del") is False
