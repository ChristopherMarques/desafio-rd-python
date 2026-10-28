"""Value Object imutável que representa coordenadas cartesianas no planalto."""

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Coordinates:
    """Coordenadas bidimensionais (X, Y) no plano cartesiano.

    Seguindo o padrão Value Object de Domain-Driven Design:
    - Imutabilidade estrita via frozen=True.
    - Igualdade estrutural por valor.
    - Operações geram novas instâncias sem mutação colateral.
    """

    x: int
    y: int

    def translate(self, dx: int, dy: int) -> "Coordinates":
        """Calcula novas coordenadas a partir de um deslocamento vetorial."""
        return Coordinates(x=self.x + dx, y=self.y + dy)

    def as_tuple(self) -> tuple[int, int]:
        """Retorna as coordenadas como tupla (x, y)."""
        return self.x, self.y

    def __repr__(self) -> str:
        return f"Coordinates(x={self.x}, y={self.y})"
