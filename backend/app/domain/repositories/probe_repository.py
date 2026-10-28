"""Contratos de persistência e repositório (Interface Segregation & DIP)."""

from typing import Protocol, runtime_checkable

from app.domain.models.probe import Probe


@runtime_checkable
class ProbeReader(Protocol):
    """Interface segregada para operações de consulta e leitura de sondas."""

    async def get_by_id(self, probe_id: str) -> Probe | None:
        """Busca uma sonda pelo seu identificador único."""
        ...

    async def list_all(self) -> list[Probe]:
        """Retorna todas as sondas cadastradas no sistema."""
        ...

    async def exists(self, probe_id: str) -> bool:
        """Verifica se uma sonda existe."""
        ...


@runtime_checkable
class ProbeWriter(Protocol):
    """Interface segregada para operações de escrita e persistência de sondas."""

    async def save(self, probe: Probe) -> None:
        """Persiste ou atualiza o estado de uma sonda."""
        ...

    async def delete(self, probe_id: str) -> bool:
        """Remove uma sonda pelo seu identificador."""
        ...


@runtime_checkable
class ProbeRepository(ProbeReader, ProbeWriter, Protocol):
    """Interface agregada do repositório de sondas.

    Seguindo o Princípio da Inversão de Dependência (DIP), os casos de uso
    dependem apenas deste contrato abstrato, permitindo que a implementação
    concreta (em memória, SQLite, PostgreSQL, etc.) seja injetada livremente.
    """

    pass
