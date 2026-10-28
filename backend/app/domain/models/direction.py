"""Enumeração e operações de orientação cardinal da sonda marciana."""

from enum import StrEnum


class Direction(StrEnum):
    """Direções cardinais suportadas pelas sondas de exploração."""

    NORTH = "NORTH"
    EAST = "EAST"
    SOUTH = "SOUTH"
    WEST = "WEST"

    def turn_left(self) -> "Direction":
        """Rotaciona 90 graus no sentido anti-horário."""
        rotations = {
            Direction.NORTH: Direction.WEST,
            Direction.WEST: Direction.SOUTH,
            Direction.SOUTH: Direction.EAST,
            Direction.EAST: Direction.NORTH,
        }
        return rotations[self]

    def turn_right(self) -> "Direction":
        """Rotaciona 90 graus no sentido horário."""
        rotations = {
            Direction.NORTH: Direction.EAST,
            Direction.EAST: Direction.SOUTH,
            Direction.SOUTH: Direction.WEST,
            Direction.WEST: Direction.NORTH,
        }
        return rotations[self]

    def vector(self) -> tuple[int, int]:
        """Retorna o vetor de deslocamento cartesiano (dx, dy) para a direção atual."""
        vectors = {
            Direction.NORTH: (0, 1),
            Direction.EAST: (1, 0),
            Direction.SOUTH: (0, -1),
            Direction.WEST: (-1, 0),
        }
        return vectors[self]

    @classmethod
    def from_str(cls, value: str) -> "Direction":
        """Converte uma string para Direction de forma case-insensitive."""
        normalized = value.strip().upper()
        try:
            return cls(normalized)
        except ValueError as exc:
            valid = ", ".join(d.value for d in cls)
            raise ValueError(
                f"Direção '{value}' inválida. Valores aceitos: {valid}."
            ) from exc

    def __str__(self) -> str:
        return self.value
