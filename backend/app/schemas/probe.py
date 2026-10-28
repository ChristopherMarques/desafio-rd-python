"""Schemas Pydantic para validação e serialização de dados da API."""

from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.domain.models.direction import Direction


class LaunchProbeRequest(BaseModel):
    """Payload para lançamento de sonda e dimensionamento da malha."""

    x: int = Field(
        ...,
        ge=1,
        description="Coordenada X máxima do canto superior direito da malha (deve ser >= 1).",
        examples=[5],
    )
    y: int = Field(
        ...,
        ge=1,
        description="Coordenada Y máxima do canto superior direito da malha (deve ser >= 1).",
        examples=[5],
    )
    direction: Direction = Field(
        ...,
        description="Direção cardinal inicial para a qual a sonda estará apontada.",
        examples=["NORTH"],
    )

    @field_validator("direction", mode="before")
    @classmethod
    def validate_direction(cls, v: Any) -> Direction:
        if isinstance(v, Direction):
            return v
        if isinstance(v, str):
            return Direction.from_str(v)
        raise ValueError("Direção deve ser uma string válida: NORTH, EAST, SOUTH ou WEST.")


class ProbeStateResponse(BaseModel):
    """Estado resumido da sonda, correspondente estrito ao contrato da RD Station."""

    id: str = Field(..., description="Identificador único da sonda.", examples=["abc123"])
    x: int = Field(..., description="Posição cartesiana X atual da sonda.", examples=[1])
    y: int = Field(..., description="Posição cartesiana Y atual da sonda.", examples=[1])
    direction: Direction = Field(
        ..., description="Direção cardinal atual da sonda.", examples=["EAST"]
    )


class MoveProbeRequest(BaseModel):
    """Payload com a sequência de comandos para movimentação da sonda."""

    commands: str = Field(
        ...,
        min_length=1,
        description="Sequência de comandos contendo M (Mover), L (Girar Esquerda), R (Girar Direita).",
        examples=["MRM"],
    )

    @field_validator("commands")
    @classmethod
    def normalize_commands(cls, v: str) -> str:
        cleaned = v.strip().upper()
        if not cleaned:
            raise ValueError("A sequência de comandos não pode ser vazia.")
        return cleaned


class ProbeListResponse(BaseModel):
    """Lista de sondas ativas no planalto conforme contrato da RD Station."""

    probes: list[ProbeStateResponse] = Field(
        default_factory=list,
        description="Lista de sondas ativas e suas posições atuais.",
    )


class ProbeDetailResponse(ProbeStateResponse):
    """Visualização estendida para a interface gráfica e telemetria da missão."""

    plateau_max_x: int = Field(..., description="Limite horizontal X do planalto.")
    plateau_max_y: int = Field(..., description="Limite vertical Y do planalto.")
    path_history: list[dict[str, Any]] = Field(
        default_factory=list,
        description="Histórico completo de passos e rotações para renderização gráfica.",
    )


class ErrorDetailResponse(BaseModel):
    """Formato estruturado de erro quando a sonda aborta uma sequência perigosa."""

    detail: str = Field(..., description="Mensagem explicativa para os operadores da missão.")
    error_code: str = Field(..., description="Código do erro de domínio.")
    failed_at_step: int | None = Field(
        None, description="Índice do caractere onde a instrução falhou."
    )
    failed_command: str | None = Field(None, description="O comando que causou o impedimento.")
    last_safe_state: ProbeStateResponse | None = Field(
        None, description="Último estado válido preservado antes do aborto."
    )
