"""Aggregate Root que modela a sonda marciana e suas regras de transição de estado."""

from dataclasses import dataclass, field
from typing import Any

from app.domain.models.coordinates import Coordinates
from app.domain.models.direction import Direction
from app.domain.models.plateau import Plateau


@dataclass
class Probe:
    """Entidade agregadora da sonda de exploração.

    Encapsula seu estado de navegação (coordenadas e direção), a referência ao
    planalto sobre o qual opera e o histórico de posições navegadas para telemetria.
    """

    id: str
    plateau: Plateau
    coordinates: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    direction: Direction = Direction.NORTH
    path_history: list[dict[str, Any]] = field(default_factory=list)

    def __post_init__(self) -> None:
        """Registra a posição inicial no histórico de telemetria se estiver vazio."""
        if not self.path_history:
            self.path_history.append(
                {
                    "x": self.coordinates.x,
                    "y": self.coordinates.y,
                    "direction": self.direction.value,
                    "action": "LANDING",
                }
            )

    def turn_left(self) -> None:
        """Gira a orientação da sonda 90 graus à esquerda mantendo a posição."""
        self.direction = self.direction.turn_left()
        self.path_history.append(
            {
                "x": self.coordinates.x,
                "y": self.coordinates.y,
                "direction": self.direction.value,
                "action": "TURN_LEFT",
            }
        )

    def turn_right(self) -> None:
        """Gira a orientação da sonda 90 graus à direita mantendo a posição."""
        self.direction = self.direction.turn_right()
        self.path_history.append(
            {
                "x": self.coordinates.x,
                "y": self.coordinates.y,
                "direction": self.direction.value,
                "action": "TURN_RIGHT",
            }
        )

    def preview_forward_coordinates(self) -> Coordinates:
        """Calcula a próxima coordenada caso a sonda avance 1 passo à frente."""
        dx, dy = self.direction.vector()
        return self.coordinates.translate(dx, dy)

    def move_to(self, new_coordinates: Coordinates) -> None:
        """Aplica a nova coordenada validada à sonda e atualiza a telemetria."""
        self.coordinates = new_coordinates
        self.path_history.append(
            {
                "x": self.coordinates.x,
                "y": self.coordinates.y,
                "direction": self.direction.value,
                "action": "MOVE",
            }
        )

    def to_state_dict(self) -> dict[str, Any]:
        """Serializa o estado atual da sonda no formato esperado pela API."""
        return {
            "id": self.id,
            "x": self.coordinates.x,
            "y": self.coordinates.y,
            "direction": self.direction.value,
        }

    def to_full_dict(self) -> dict[str, Any]:
        """Serializa o estado completo incluindo planalto e telemetria para o frontend."""
        return {
            "id": self.id,
            "x": self.coordinates.x,
            "y": self.coordinates.y,
            "direction": self.direction.value,
            "plateau": {
                "max_x": self.plateau.max_x,
                "max_y": self.plateau.max_y,
            },
            "path_history": list(self.path_history),
        }
