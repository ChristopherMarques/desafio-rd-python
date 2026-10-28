"""Caso de Uso para listagem e consulta de sondas ativas."""

from app.core.exceptions import ProbeNotFoundException
from app.domain.models.probe import Probe
from app.domain.repositories.probe_repository import ProbeRepository


class ListProbesUseCase:
    """Recupera a lista completa de sondas ativas registradas."""

    def __init__(self, repository: ProbeRepository) -> None:
        self._repository = repository

    async def execute(self) -> list[Probe]:
        return await self._repository.list_all()


class GetProbeUseCase:
    """Recupera o estado detalhado de uma sonda específica pelo seu ID."""

    def __init__(self, repository: ProbeRepository) -> None:
        self._repository = repository

    async def execute(self, probe_id: str) -> Probe:
        probe = await self._repository.get_by_id(probe_id)
        if probe is None:
            raise ProbeNotFoundException(probe_id=probe_id)
        return probe
