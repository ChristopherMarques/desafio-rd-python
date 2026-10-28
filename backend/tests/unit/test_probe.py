"""Testes unitários para o Aggregate Root Probe."""

from app.domain.models.coordinates import Coordinates
from app.domain.models.direction import Direction
from app.domain.models.plateau import Plateau
from app.domain.models.probe import Probe


def test_probe_initial_state() -> None:
    plateau = Plateau(max_x=5, max_y=5)
    probe = Probe(id="test-1", plateau=plateau, direction=Direction.NORTH)

    assert probe.id == "test-1"
    assert probe.coordinates == Coordinates(0, 0)
    assert probe.direction == Direction.NORTH
    assert len(probe.path_history) == 1
    assert probe.path_history[0]["action"] == "LANDING"


def test_probe_turn_left_updates_direction_and_history() -> None:
    plateau = Plateau(max_x=5, max_y=5)
    probe = Probe(id="test-1", plateau=plateau, direction=Direction.NORTH)

    probe.turn_left()
    assert probe.direction == Direction.WEST
    assert probe.coordinates == Coordinates(0, 0)
    assert probe.path_history[-1]["action"] == "TURN_LEFT"
    assert probe.path_history[-1]["direction"] == "WEST"


def test_probe_turn_right_updates_direction_and_history() -> None:
    plateau = Plateau(max_x=5, max_y=5)
    probe = Probe(id="test-1", plateau=plateau, direction=Direction.NORTH)

    probe.turn_right()
    assert probe.direction == Direction.EAST
    assert probe.coordinates == Coordinates(0, 0)
    assert probe.path_history[-1]["action"] == "TURN_RIGHT"
    assert probe.path_history[-1]["direction"] == "EAST"


def test_probe_preview_forward_coordinates() -> None:
    plateau = Plateau(max_x=5, max_y=5)
    probe = Probe(
        id="test-1",
        plateau=plateau,
        coordinates=Coordinates(2, 2),
        direction=Direction.NORTH,
    )

    preview = probe.preview_forward_coordinates()
    assert preview == Coordinates(2, 3)
    # Garante que as coordenadas da sonda não foram alteradas no preview
    assert probe.coordinates == Coordinates(2, 2)


def test_probe_move_to_updates_coordinates_and_history() -> None:
    plateau = Plateau(max_x=5, max_y=5)
    probe = Probe(id="test-1", plateau=plateau, direction=Direction.NORTH)

    target = Coordinates(0, 1)
    probe.move_to(target)

    assert probe.coordinates == target
    assert probe.path_history[-1]["action"] == "MOVE"
    assert probe.path_history[-1]["x"] == 0
    assert probe.path_history[-1]["y"] == 1


def test_probe_to_state_dict() -> None:
    plateau = Plateau(max_x=5, max_y=5)
    probe = Probe(
        id="abc123",
        plateau=plateau,
        coordinates=Coordinates(1, 1),
        direction=Direction.EAST,
    )

    assert probe.to_state_dict() == {
        "id": "abc123",
        "x": 1,
        "y": 1,
        "direction": "EAST",
    }
