"""Testes unitários para o Value Object Coordinates."""

from dataclasses import FrozenInstanceError

import pytest

from app.domain.models.coordinates import Coordinates


def test_coordinates_creation_and_attributes() -> None:
    coords = Coordinates(x=3, y=5)
    assert coords.x == 3
    assert coords.y == 5
    assert coords.as_tuple() == (3, 5)


def test_coordinates_immutability() -> None:
    coords = Coordinates(x=1, y=2)
    with pytest.raises(FrozenInstanceError):
        coords.x = 10  # type: ignore[misc]


def test_coordinates_structural_equality() -> None:
    c1 = Coordinates(x=4, y=4)
    c2 = Coordinates(x=4, y=4)
    c3 = Coordinates(x=4, y=5)

    assert c1 == c2
    assert c1 != c3
    assert hash(c1) == hash(c2)


def test_coordinates_translate() -> None:
    origin = Coordinates(x=2, y=2)
    moved = origin.translate(dx=1, dy=-2)

    assert moved == Coordinates(x=3, y=0)
    # Garante que a instância original permaneceu intacta
    assert origin == Coordinates(x=2, y=2)
