"""Comando para rotacionar a orientação da sonda 90 graus à direita."""

from app.domain.commands.base import Command
from app.domain.models.probe import Probe


class TurnRightCommand(Command):
    """Executa rotação no sentido horário mantendo as coordenadas atuais."""

    symbol: str = "R"

    def execute(self, probe: Probe, step_index: int) -> None:
        probe.turn_right()
