"""Implementação SQLite durável do repositório de sondas (Princípio da Substituição de Liskov)."""

import asyncio
import json
import sqlite3
from typing import Any

from app.domain.models.coordinates import Coordinates
from app.domain.models.direction import Direction
from app.domain.models.plateau import Plateau
from app.domain.models.probe import Probe
from app.domain.repositories.probe_repository import ProbeRepository


class SqliteProbeRepository(ProbeRepository):
    """Persistência relacional em SQLite compatível com Liskov Substitution.

    Executa operações bloqueantes de I/O em pool de threads gerenciado pelo
    asyncio.to_thread, garantindo alta vazão e compatibilidade com o loop do FastAPI.
    """

    def __init__(self, db_path: str = "mars_probes.db") -> None:
        self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._get_connection() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS probes (
                    id TEXT PRIMARY KEY,
                    max_x INTEGER NOT NULL,
                    max_y INTEGER NOT NULL,
                    current_x INTEGER NOT NULL,
                    current_y INTEGER NOT NULL,
                    direction TEXT NOT NULL,
                    path_history_json TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def _row_to_probe(self, row: sqlite3.Row) -> Probe:
        plateau = Plateau(max_x=row["max_x"], max_y=row["max_y"])
        coords = Coordinates(x=row["current_x"], y=row["current_y"])
        direction = Direction.from_str(row["direction"])
        history: list[dict[str, Any]] = json.loads(row["path_history_json"])
        return Probe(
            id=row["id"],
            plateau=plateau,
            coordinates=coords,
            direction=direction,
            path_history=history,
        )

    async def save(self, probe: Probe) -> None:
        def _save_sync() -> None:
            with self._get_connection() as conn:
                conn.execute(
                    """
                    INSERT INTO probes (
                        id, max_x, max_y, current_x, current_y, direction, path_history_json
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        current_x = excluded.current_x,
                        current_y = excluded.current_y,
                        direction = excluded.direction,
                        path_history_json = excluded.path_history_json
                    """,
                    (
                        probe.id,
                        probe.plateau.max_x,
                        probe.plateau.max_y,
                        probe.coordinates.x,
                        probe.coordinates.y,
                        probe.direction.value,
                        json.dumps(probe.path_history),
                    ),
                )
                conn.commit()

        await asyncio.to_thread(_save_sync)

    async def get_by_id(self, probe_id: str) -> Probe | None:
        def _get_sync() -> Probe | None:
            with self._get_connection() as conn:
                cursor = conn.execute("SELECT * FROM probes WHERE id = ?", (probe_id,))
                row = cursor.fetchone()
                return self._row_to_probe(row) if row is not None else None

        return await asyncio.to_thread(_get_sync)

    async def list_all(self) -> list[Probe]:
        def _list_sync() -> list[Probe]:
            with self._get_connection() as conn:
                cursor = conn.execute("SELECT * FROM probes ORDER BY rowid ASC")
                rows = cursor.fetchall()
                return [self._row_to_probe(r) for r in rows]

        return await asyncio.to_thread(_list_sync)

    async def exists(self, probe_id: str) -> bool:
        def _exists_sync() -> bool:
            with self._get_connection() as conn:
                cursor = conn.execute("SELECT 1 FROM probes WHERE id = ?", (probe_id,))
                return cursor.fetchone() is not None

        return await asyncio.to_thread(_exists_sync)

    async def delete(self, probe_id: str) -> bool:
        def _delete_sync() -> bool:
            with self._get_connection() as conn:
                cursor = conn.execute("DELETE FROM probes WHERE id = ?", (probe_id,))
                conn.commit()
                return cursor.rowcount > 0

        return await asyncio.to_thread(_delete_sync)
