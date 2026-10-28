"""Implementação em memória do repositório de sondas (Princípio da Substituição de Liskov)."""

import asyncio
from copy import deepcopy

from app.domain.models.probe import Probe
from app.domain.repositories.probe_repository import ProbeRepository


class InMemoryProbeRepository(ProbeRepository):
    """Armazenamento em memória com controle de concorrência assíncrono.

    Adequado para ambientes de teste, desenvolvimento ágil e cenários onde
    persistência em disco não é obrigatória, cumprindo o contrato ProbeRepository.
    """

    def __init__(self) -> None:
        self._storage: dict[str, Probe] = {}
        self._lock = asyncio.Lock()

    async def save(self, probe: Probe) -> None:
        """Salva ou atualiza a sonda no dicionário interno protegido por Lock."""
        async with self._lock:
            # Clona profundamente para evitar mutações acidentais fora do repositório
            self._storage[probe.id] = deepcopy(probe)

    async def get_by_id(self, probe_id: str) -> Probe | None:
        """Recupera uma cópia da sonda armazenada pelo identificador."""
        async with self._lock:
            probe = self._storage.get(probe_id)
            return deepcopy(probe) if probe is not None else None

    async def list_all(self) -> list[Probe]:
        """Retorna uma lista com todas as sondas registradas."""
        async with self._lock:
            return [deepcopy(p) for p in self._storage.values()]

    async def exists(self, probe_id: str) -> bool:
        """Checa se o ID informado já está cadastrado."""
        async with self._lock:
            return probe_id in self._storage

    async def delete(self, probe_id: str) -> bool:
        """Remove a sonda do repositório."""
        async with self._lock:
            return self._storage.pop(probe_id, None) is not None

    async def clear(self) -> None:
        """Método auxiliar para resetar o estado em suítes de testes."""
        async with self._lock:
            self._storage.clear()
