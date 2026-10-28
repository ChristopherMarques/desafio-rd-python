"""Agregador de rotas da versão v1 da API."""

from fastapi import APIRouter

from app.api.v1.endpoints import probes

api_router = APIRouter()
api_router.include_router(probes.router)
