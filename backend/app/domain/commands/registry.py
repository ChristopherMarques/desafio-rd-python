"""Registro extensível de comandos (Princípio Aberto/Fechado - OCP)."""


from app.core.exceptions import InvalidCommandException
from app.domain.commands.base import Command
from app.domain.commands.move import MoveForwardCommand
from app.domain.commands.turn_left import TurnLeftCommand
from app.domain.commands.turn_right import TurnRightCommand


class CommandRegistry:
    """Centraliza o mapeamento e instanciação de comandos para a sonda.

    Seguindo o princípio Aberto/Fechado (OCP), novos comandos podem ser
    registrados dinamicamente sem necessidade de alterar o código de parsing
    ou a lógica de execução dos casos de uso.
    """

    def __init__(self) -> None:
        self._commands: dict[str, Command] = {}
        self._register_default_commands()

    def _register_default_commands(self) -> None:
        """Registra os comandos padrão exigidos pela especificação da missão."""
        self.register("M", MoveForwardCommand())
        self.register("L", TurnLeftCommand())
        self.register("R", TurnRightCommand())

    def register(self, symbol: str, command: Command) -> None:
        """Registra um novo comando associado a um caractere identificador."""
        self._commands[symbol.upper()] = command

    def get(self, symbol: str, step_index: int) -> Command:
        """Recupera a instância de comando correspondente ao símbolo.

        Levanta InvalidCommandException caso o caractere não seja reconhecido.
        """
        normalized = symbol.upper()
        command = self._commands.get(normalized)
        if command is None:
            raise InvalidCommandException(command=symbol, index=step_index)
        return command

    def is_valid_symbol(self, symbol: str) -> bool:
        """Verifica se um símbolo possui comando registrado."""
        return symbol.upper() in self._commands
