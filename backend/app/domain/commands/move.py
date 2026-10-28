"""Comando para mover a sonda um passo adiante na direção atual."""

from app.core.exceptions import ProbeOutOfBoundsException
from app.domain.commands.base import Command
from app.domain.models.probe import Probe


class MoveForwardCommand(Command):
    """Executa o avanço de um quadrante na direção em que a sonda está virada.

    Verifica preventivamente se o movimento pretendido viola os limites
    do planalto. Em caso afirmativo, aborta a execução levantando
    ProbeOutOfBoundsException com o último estado seguro intacto.
    """

    symbol: str = "M"

    def execute(self, probe: Probe, step_index: int) -> None:
        target_coords = probe.preview_forward_coordinates()

        if not probe.plateau.contains(target_coords):
            raise ProbeOutOfBoundsException(
                probe_id=probe.id,
                attempted_x=target_coords.x,
                attempted_y=target_coords.y,
                plateau_max_x=probe.plateau.max_x,
                plateau_max_y=probe.plateau.max_y,
                step_index=step_index,
                failed_command=self.symbol,
                last_safe_state=probe.to_state_dict(),
            )

        probe.move_to(target_coords)
