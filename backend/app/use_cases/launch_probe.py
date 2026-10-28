"""Caso de Uso para criação do planalto e lançamento da sonda."""

import uuid

from app.domain.models.coordinates import Coordinates
from app.domain.models.direction import Direction
from app.domain.models.plateau import Plateau
from app.domain.models.probe import Probe
from app.domain.repositories.probe_repository import ProbeRepository


class LaunchProbeUseCase:
    """Orquestra a configuração da malha de exploração e o pouso da sonda.

    Seguindo as regras de negócio:
    - O planalto recebe as dimensões máximas (max_x, max_y).
    - A sonda sempre inicia sua missão no quadrante inicial (0, 0).
    - A orientação cardinal inicial é definida pelo operador.
    - É gerado um identificador único para rastreamento posterior.
    """

    def __init__(self, repository: ProbeRepository) -> None:
        self._repository = repository

    async def execute(
        self,
        max_x: int,
        max_y: int,
        direction: Direction,
        custom_id: str | None = None,
    ) -> Probe:
        plateau = Plateau(max_x=max_x, max_y=max_y)

        # Gera identificador legível e único (ex: 'prb-8a1f2b' ou customizado)
        probe_id = custom_id or f"prb-{uuid.uuid4().hex[:6]}"

        probe = Probe(
            id=probe_id,
            plateau=plateau,
            coordinates=Coordinates(x=0, y=0),
            direction=direction,
        )

        await self._repository.save(probe)
        return probe
