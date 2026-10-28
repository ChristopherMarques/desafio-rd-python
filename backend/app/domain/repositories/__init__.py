"""Contratos de persistência e repositórios."""

from app.domain.repositories.probe_repository import (
    ProbeReader,
    ProbeRepository,
    ProbeWriter,
)

__all__ = ["ProbeReader", "ProbeWriter", "ProbeRepository"]
