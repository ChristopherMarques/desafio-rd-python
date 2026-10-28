"""Comando para rotacionar a orientação da sonda 90 graus à esquerda."""

from app.domain.commands.base import Command
from app.domain.models.probe import Probe


class TurnLeftCommand(Command):
    """Executa rotação no sentido anti-horário mantendo as coordenadas atuais."""

    symbol: str = "L"

    def execute(self, probe: Probe, step_index: int) -> None:
        probe.turn_left()
