"""Configurações da aplicação utilizando Pydantic Settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações centralizadas com suporte a variáveis de ambiente."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Mars Probe Exploration API"
    app_version: str = "1.0.0"
    app_description: str = (
        "API RESTful que arquitetei e desenvolvi para controle e exploração de sondas em Marte. "
        "Construída com FastAPI e princípios SOLID para o Desafio Técnico RD Station."
    )
    api_prefix: str = "/api/v1"
    environment: str = "development"
    debug: bool = False

    # Armazenamento: 'in_memory' ou 'sqlite'
    storage_type: str = "in_memory"
    sqlite_db_path: str = "mars_probes.db"

    # CORS
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",
    ]


settings = Settings()
