"""Caso de Uso para processamento sequencial de comandos de movimento da sonda."""

from app.core.exceptions import (
    DomainException,
    ProbeNotFoundException,
    ProbeOutOfBoundsException,
)
from app.domain.commands.registry import CommandRegistry
from app.domain.models.probe import Probe
from app.domain.repositories.probe_repository import ProbeRepository


class MoveProbeUseCase:
    """Executa sequências de comando com validação atômica de integridade.

    Regra de Ouro da Missão:
    - Se uma sequência contiver comandos inválidos ou tentar transpassar a fronteira
      do planalto, a sonda NÃO executa a sequência inteira.
    - Ela é interrompida no último estado seguro e os operadores recebem os detalhes
      da falha e a posição preservada.
    """

    def __init__(self, repository: ProbeRepository, registry: CommandRegistry) -> None:
        self._repository = repository
        self._registry = registry

    async def execute(self, probe_id: str, commands: str) -> Probe:
        probe = await self._repository.get_by_id(probe_id)
        if probe is None:
            raise ProbeNotFoundException(probe_id=probe_id)

        clean_commands = commands.strip().upper()

        for index, symbol in enumerate(clean_commands):
            try:
                command = self._registry.get(symbol, step_index=index)
                command.execute(probe, step_index=index)
            except ProbeOutOfBoundsException as exc:
                # Salva o estado seguro alcançado até antes do movimento proibido
                await self._repository.save(probe)
                raise exc
            except DomainException as exc:
                # Qualquer outra violação de domínio interrompe imediatamente
                await self._repository.save(probe)
                raise exc

        # Todos os comandos foram executados com sucesso dentro da malha
        await self._repository.save(probe)
        return probe
