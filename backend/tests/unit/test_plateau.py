"""Testes unitários para o modelo de domínio Plateau."""

import pytest

from app.core.exceptions import InvalidPlateauDimensionsException
from app.domain.models.coordinates import Coordinates
from app.domain.models.plateau import Plateau


def test_plateau_valid_dimensions() -> None:
    plateau = Plateau(max_x=5, max_y=5)
    assert plateau.max_x == 5
    assert plateau.max_y == 5


@pytest.mark.parametrize(
    ("x", "y"),
    [
        (0, 5),
        (5, 0),
        (-1, 5),
        (5, -1),
        (0, 0),
    ],
)
def test_plateau_invalid_dimensions_raises_exception(x: int, y: int) -> None:
    with pytest.raises(InvalidPlateauDimensionsException):
        Plateau(max_x=x, max_y=y)


def test_plateau_contains_coordinates() -> None:
    plateau = Plateau(max_x=5, max_y=5)

    # Cantos válidos
    assert plateau.contains(Coordinates(0, 0)) is True
    assert plateau.contains(Coordinates(5, 5)) is True
    assert plateau.contains(Coordinates(0, 5)) is True
    assert plateau.contains(Coordinates(5, 0)) is True
    assert plateau.contains(Coordinates(2, 3)) is True

    # Fora dos limites
    assert plateau.contains(Coordinates(-1, 0)) is False
    assert plateau.contains(Coordinates(0, -1)) is False
    assert plateau.contains(Coordinates(6, 5)) is False
    assert plateau.contains(Coordinates(5, 6)) is False
    assert plateau.contains(Coordinates(10, 10)) is False
