"""Testes unitários para o enum e operações da Direction."""

import pytest

from app.domain.models.direction import Direction


def test_direction_turn_left_full_cycle() -> None:
    current = Direction.NORTH
    current = current.turn_left()
    assert current == Direction.WEST
    current = current.turn_left()
    assert current == Direction.SOUTH
    current = current.turn_left()
    assert current == Direction.EAST
    current = current.turn_left()
    assert current == Direction.NORTH


def test_direction_turn_right_full_cycle() -> None:
    current = Direction.NORTH
    current = current.turn_right()
    assert current == Direction.EAST
    current = current.turn_right()
    assert current == Direction.SOUTH
    current = current.turn_right()
    assert current == Direction.WEST
    current = current.turn_right()
    assert current == Direction.NORTH


def test_direction_vectors() -> None:
    assert Direction.NORTH.vector() == (0, 1)
    assert Direction.EAST.vector() == (1, 0)
    assert Direction.SOUTH.vector() == (0, -1)
    assert Direction.WEST.vector() == (-1, 0)


def test_direction_from_str_case_insensitive() -> None:
    assert Direction.from_str("north") == Direction.NORTH
    assert Direction.from_str(" East ") == Direction.EAST
    assert Direction.from_str("SOUTH") == Direction.SOUTH
    assert Direction.from_str("west") == Direction.WEST


def test_direction_from_str_invalid() -> None:
    with pytest.raises(ValueError, match="Direção 'UP' inválida"):
        Direction.from_str("UP")
