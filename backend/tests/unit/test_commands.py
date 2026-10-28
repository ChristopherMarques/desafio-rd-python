"""Testes unitários para o Command Pattern e CommandRegistry."""

import pytest

from app.core.exceptions import InvalidCommandException, ProbeOutOfBoundsException
from app.domain.commands.base import Command
from app.domain.commands.move import MoveForwardCommand
from app.domain.commands.registry import CommandRegistry
from app.domain.commands.turn_left import TurnLeftCommand
from app.domain.commands.turn_right import TurnRightCommand
from app.domain.models.coordinates import Coordinates
from app.domain.models.direction import Direction
from app.domain.models.plateau import Plateau
from app.domain.models.probe import Probe


def test_turn_left_command_execution() -> None:
    probe = Probe(id="1", plateau=Plateau(5, 5), direction=Direction.NORTH)
    cmd = TurnLeftCommand()

    cmd.execute(probe, step_index=0)
    assert probe.direction == Direction.WEST


def test_turn_right_command_execution() -> None:
    probe = Probe(id="1", plateau=Plateau(5, 5), direction=Direction.NORTH)
    cmd = TurnRightCommand()

    cmd.execute(probe, step_index=0)
    assert probe.direction == Direction.EAST


def test_move_forward_command_success() -> None:
    probe = Probe(
        id="1",
        plateau=Plateau(5, 5),
        coordinates=Coordinates(0, 0),
        direction=Direction.NORTH,
    )
    cmd = MoveForwardCommand()

    cmd.execute(probe, step_index=0)
    assert probe.coordinates == Coordinates(0, 1)


def test_move_forward_command_prevents_out_of_bounds() -> None:
    probe = Probe(
        id="1",
        plateau=Plateau(5, 5),
        coordinates=Coordinates(0, 5),
        direction=Direction.NORTH,
    )
    cmd = MoveForwardCommand()

    with pytest.raises(ProbeOutOfBoundsException) as exc_info:
        cmd.execute(probe, step_index=2)

    # Verifica se os detalhes do erro estão íntegros
    assert exc_info.value.probe_id == "1"
    assert exc_info.value.attempted_x == 0
    assert exc_info.value.attempted_y == 6
    assert exc_info.value.step_index == 2
    assert exc_info.value.failed_command == "M"

    # Confirma que a sonda permaneceu estritamente no estado seguro
    assert probe.coordinates == Coordinates(0, 5)
    assert probe.direction == Direction.NORTH


def test_command_registry_default_symbols() -> None:
    registry = CommandRegistry()
    assert isinstance(registry.get("M", 0), MoveForwardCommand)
    assert isinstance(registry.get("L", 0), TurnLeftCommand)
    assert isinstance(registry.get("R", 0), TurnRightCommand)


def test_command_registry_invalid_symbol_raises_exception() -> None:
    registry = CommandRegistry()
    with pytest.raises(InvalidCommandException) as exc_info:
        registry.get("X", step_index=4)

    assert exc_info.value.command == "X"
    assert exc_info.value.index == 4


def test_command_registry_extensibility_ocp() -> None:
    """Demonstra o Princípio Aberto/Fechado (OCP): estendendo com novo comando U-Turn."""

    class UTurnCommand(Command):
        def execute(self, probe: Probe, step_index: int) -> None:
            probe.turn_left()
            probe.turn_left()

    registry = CommandRegistry()
    registry.register("U", UTurnCommand())

    probe = Probe(id="1", plateau=Plateau(5, 5), direction=Direction.NORTH)
    custom_cmd = registry.get("U", 0)
    custom_cmd.execute(probe, step_index=0)

    assert probe.direction == Direction.SOUTH
