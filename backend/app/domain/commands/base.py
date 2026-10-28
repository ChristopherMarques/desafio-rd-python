"""Protocolo base para comandos executáveis da sonda (Command Pattern)."""

from typing import Protocol

from app.domain.models.probe import Probe


class Command(Protocol):
    """Contrato que todo comando de sonda deve implementar.

    Permite desacoplar a emissão dos comandos de sua execução direta,
    facilitando testes, auditoria, cancelamento e extensibilidade futura.
    """

    def execute(self, probe: Probe, step_index: int) -> None:
        """Executa a instrução sobre a sonda informada."""
        ...
