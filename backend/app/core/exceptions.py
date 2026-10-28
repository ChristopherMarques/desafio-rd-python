"""Exceções de domínio e negócio da aplicação Mars Probe."""

from typing import Any


class DomainException(Exception):
    """Exceção base para todas as violações de regras de domínio."""

    def __init__(self, message: str, code: str = "DOMAIN_ERROR") -> None:
        super().__init__(message)
        self.message = message
        self.code = code


class InvalidPlateauDimensionsException(DomainException):
    """Lançada quando as dimensões máximas fornecidas para a malha são inválidas."""

    def __init__(self, width: int, height: int) -> None:
        super().__init__(
            message=f"Dimensões do planalto inválidas: largura={width}, altura={height}. "
            f"Ambas devem ser inteiros maiores ou iguais a 1.",
            code="INVALID_PLATEAU_DIMENSIONS",
        )
        self.width = width
        self.height = height


class ProbeNotFoundException(DomainException):
    """Lançada quando a sonda solicitada não é encontrada no repositório."""

    def __init__(self, probe_id: str) -> None:
        super().__init__(
            message=f"Sonda com identificador '{probe_id}' não foi encontrada.",
            code="PROBE_NOT_FOUND",
        )
        self.probe_id = probe_id


class InvalidCommandException(DomainException):
    """Lançada quando um comando não reconhecido é submetido à sonda."""

    def __init__(self, command: str, index: int) -> None:
        super().__init__(
            message=f"Comando '{command}' inválido no índice {index}. "
            f"Comandos aceitos: M (mover), L (virar à esquerda), R (virar à direita).",
            code="INVALID_COMMAND",
        )
        self.command = command
        self.index = index


class ProbeOutOfBoundsException(DomainException):
    """Lançada quando um comando de movimento faria a sonda cair do planalto.

    Mantém o estado seguro anterior para permitir que a API reporte o ponto exato
    onde a sequência foi interrompida com segurança.
    """

    def __init__(
        self,
        probe_id: str,
        attempted_x: int,
        attempted_y: int,
        plateau_max_x: int,
        plateau_max_y: int,
        step_index: int,
        failed_command: str,
        last_safe_state: dict[str, Any],
    ) -> None:
        super().__init__(
            message=(
                f"Movimento abortado no passo {step_index} ('{failed_command}'): "
                f"as coordenadas ({attempted_x}, {attempted_y}) ultrapassam os limites "
                f"do planalto (0..{plateau_max_x}, 0..{plateau_max_y}). A sonda parou "
                f"em segurança na posição ({last_safe_state['x']}, {last_safe_state['y']}, "
                f"{last_safe_state['direction']})."
            ),
            code="PROBE_OUT_OF_BOUNDS",
        )
        self.probe_id = probe_id
        self.attempted_x = attempted_x
        self.attempted_y = attempted_y
        self.plateau_max_x = plateau_max_x
        self.plateau_max_y = plateau_max_y
        self.step_index = step_index
        self.failed_command = failed_command
        self.last_safe_state = last_safe_state
