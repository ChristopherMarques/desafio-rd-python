"""Entidade que modela o planalto marciano e suas fronteiras navegáveis."""

from dataclasses import dataclass

from app.core.exceptions import InvalidPlateauDimensionsException
from app.domain.models.coordinates import Coordinates


@dataclass(frozen=True, slots=True)
class Plateau:
    """Representa a malha retangular navegável do planalto marciano.

    O planalto inicia convencionalmente na coordenada (0, 0) no canto inferior esquerdo
    e se estende até as coordenadas máximas (max_x, max_y) no canto superior direito.
    """

    max_x: int
    max_y: int

    def __post_init__(self) -> None:
        """Garante a invariante de que a malha deve ter pelo menos tamanho 1x1."""
        if self.max_x < 1 or self.max_y < 1:
            raise InvalidPlateauDimensionsException(width=self.max_x, height=self.max_y)

    def contains(self, coordinates: Coordinates) -> bool:
        """Verifica se uma coordenada reside estritamente dentro dos limites da malha."""
        return 0 <= coordinates.x <= self.max_x and 0 <= coordinates.y <= self.max_y

    def __repr__(self) -> str:
        return f"Plateau(0..{self.max_x}, 0..{self.max_y})"
