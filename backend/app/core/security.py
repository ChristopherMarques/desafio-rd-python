"""Módulo de segurança e middleware de proteção HTTP (OWASP Secure Headers)."""

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Aplica cabeçalhos HTTP recomendados pelo OWASP para endurecimento da API.

    Previne vulnerabilidades comuns como MIME-sniffing, Clickjacking,
    injeções cruzadas de script e exposição indevida de dados do referenciador.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)

        # Previne que o navegador tente adivinhar o tipo MIME do payload
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Previne inclusão da API dentro de frames/iframes maliciosos (Anti-Clickjacking)
        response.headers["X-Frame-Options"] = "DENY"

        # Proteção contra XSS refletido em navegadores legados
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Força comunicação estrita via HTTPS com expiração em 1 ano
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        # Controla o vazamento de informações de origem nas requisições
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Desativa permissões de hardware desnecessárias para uma API de dados
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

        return response
