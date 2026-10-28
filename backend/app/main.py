"""Ponto de entrada principal da aplicação FastAPI Mars Probe Exploration."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.endpoints import probes as probes_endpoints
from app.api.v1.router import api_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Gerenciamento de inicialização e desligamento gracioso da API."""
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.app_description,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configuração de CORS para permitir requisições do frontend React / Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui rotas sob /api/v1 (boa prática de versionamento)
app.include_router(api_router, prefix=settings.api_prefix)

# Inclui também diretamente na raiz /probes para conformidade estrita com o contrato do desafio
app.include_router(probes_endpoints.router)


@app.get(
    "/health",
    tags=["Diagnóstico"],
    summary="Health Check",
    description="Verifica a integridade e disponibilidade do serviço.",
)
async def health_check() -> JSONResponse:
    return JSONResponse(
        content={
            "status": "healthy",
            "service": settings.app_name,
            "version": settings.app_version,
            "storage": settings.storage_type,
        }
    )


@app.get("/", include_in_schema=False)
async def root() -> JSONResponse:
    return JSONResponse(
        content={
            "message": "Mars Probe Exploration API está ativa.",
            "documentation": "/docs",
            "redoc": "/redoc",
            "health": "/health",
            "endpoints": {
                "launch_probe": "POST /probes",
                "move_probe": "POST /probes/{id}/move",
                "list_probes": "GET /probes",
            },
        }
    )
