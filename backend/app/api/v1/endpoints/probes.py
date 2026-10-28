"""Endpoints HTTP RESTful para controle das sondas marcianas."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import (
    get_launch_probe_use_case,
    get_list_probes_use_case,
    get_move_probe_use_case,
    get_single_probe_use_case,
)
from app.core.exceptions import (
    InvalidCommandException,
    InvalidPlateauDimensionsException,
    ProbeNotFoundException,
    ProbeOutOfBoundsException,
)
from app.schemas.probe import (
    ErrorDetailResponse,
    LaunchProbeRequest,
    MoveProbeRequest,
    ProbeDetailResponse,
    ProbeListResponse,
    ProbeStateResponse,
)
from app.use_cases.launch_probe import LaunchProbeUseCase
from app.use_cases.list_probes import GetProbeUseCase, ListProbesUseCase
from app.use_cases.move_probe import MoveProbeUseCase

router = APIRouter(prefix="/probes", tags=["Sondas Marcianas"])


@router.post(
    "",
    response_model=ProbeStateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="1. Lançar sonda e Configurar malha",
    description=(
        "Define as dimensões máximas da malha navegável (X, Y) e pousa a sonda "
        "na posição inicial fixa (0, 0) virada para a direção cardinal indicada. "
        "Retorna um identificador único para as próximas operações."
    ),
    responses={
        201: {"model": ProbeStateResponse, "description": "Sonda lançada com sucesso."},
        400: {"model": ErrorDetailResponse, "description": "Dimensões da malha inválidas."},
    },
)
async def launch_probe(
    payload: LaunchProbeRequest,
    use_case: Annotated[LaunchProbeUseCase, Depends(get_launch_probe_use_case)],
) -> ProbeStateResponse:
    try:
        probe = await use_case.execute(
            max_x=payload.x,
            max_y=payload.y,
            direction=payload.direction,
        )
        return ProbeStateResponse(**probe.to_state_dict())
    except InvalidPlateauDimensionsException as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"detail": exc.message, "error_code": exc.code},
        ) from exc


@router.post(
    "/{probe_id}/move",
    response_model=ProbeStateResponse,
    status_code=status.HTTP_200_OK,
    summary="2. Mover sonda",
    description=(
        "Executa uma sequência de comandos (M=Mover 1 espaço, L=Girar 90° à esquerda, "
        "R=Girar 90° à direita). Se um comando tentar sair da malha ou for inválido, "
        "a execução é interrompida com segurança e retorna status 422 com o último estado válido mantido."
    ),
    responses={
        200: {"model": ProbeStateResponse, "description": "Sequência executada com sucesso."},
        404: {"model": ErrorDetailResponse, "description": "Sonda não encontrada."},
        422: {"model": ErrorDetailResponse, "description": "Instrução inválida ou perigo de queda da malha."},
    },
)
async def move_probe(
    probe_id: str,
    payload: MoveProbeRequest,
    use_case: Annotated[MoveProbeUseCase, Depends(get_move_probe_use_case)],
) -> ProbeStateResponse:
    try:
        probe = await use_case.execute(
            probe_id=probe_id,
            commands=payload.commands,
        )
        return ProbeStateResponse(**probe.to_state_dict())
    except ProbeNotFoundException as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "detail": exc.message,
                "error_code": exc.code,
                "failed_at_step": None,
                "failed_command": None,
                "last_safe_state": None,
            },
        ) from exc
    except ProbeOutOfBoundsException as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "detail": exc.message,
                "error_code": exc.code,
                "failed_at_step": exc.step_index,
                "failed_command": exc.failed_command,
                "last_safe_state": exc.last_safe_state,
            },
        ) from exc
    except InvalidCommandException as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "detail": exc.message,
                "error_code": exc.code,
                "failed_at_step": exc.index,
                "failed_command": exc.command,
                "last_safe_state": None,
            },
        ) from exc


@router.get(
    "",
    response_model=ProbeListResponse,
    status_code=status.HTTP_200_OK,
    summary="3. Ver posição de todas as sondas",
    description="Retorna a lista com o estado e posição de todas as sondas ativas no planalto.",
)
async def list_probes(
    use_case: Annotated[ListProbesUseCase, Depends(get_list_probes_use_case)],
) -> ProbeListResponse:
    probes = await use_case.execute()
    return ProbeListResponse(
        probes=[ProbeStateResponse(**p.to_state_dict()) for p in probes]
    )


@router.get(
    "/{probe_id}",
    response_model=ProbeDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="4. Ver detalhes e telemetria de uma sonda",
    description="Retorna dados estendidos da sonda incluindo dimensões do planalto e histórico de passos.",
)
async def get_probe_detail(
    probe_id: str,
    use_case: Annotated[GetProbeUseCase, Depends(get_single_probe_use_case)],
) -> ProbeDetailResponse:
    try:
        probe = await use_case.execute(probe_id=probe_id)
        return ProbeDetailResponse(
            id=probe.id,
            x=probe.coordinates.x,
            y=probe.coordinates.y,
            direction=probe.direction,
            plateau_max_x=probe.plateau.max_x,
            plateau_max_y=probe.plateau.max_y,
            path_history=probe.path_history,
        )
    except ProbeNotFoundException as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": exc.message, "error_code": exc.code},
        ) from exc
