"""Apply SQL migrations from server/migrations in filename order.

This is a bridge runner until Alembic scaffolding is added to the repository.
"""

from __future__ import annotations

from pathlib import Path
from sqlalchemy import create_engine, text

from app.core.config import DATABASE_URL


MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"


def main() -> None:
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not configured.")

    if not MIGRATIONS_DIR.exists():
        print("No migrations directory found; nothing to apply.")
        return

    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))

    if not migration_files:
        print("No SQL migration files found; nothing to apply.")
        return

    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    filename TEXT PRIMARY KEY,
                    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                """
            )
        )

        applied_rows = conn.execute(text("SELECT filename FROM schema_migrations")).all()
        applied = {row[0] for row in applied_rows}

        for migration_path in migration_files:
            filename = migration_path.name
            if filename in applied:
                continue

            sql = migration_path.read_text(encoding="utf-8")
            print(f"Applying migration: {filename}")
            conn.execute(text(sql))
            conn.execute(
                text("INSERT INTO schema_migrations (filename) VALUES (:filename)"),
                {"filename": filename},
            )

    print("Migration run complete.")


if __name__ == "__main__":
    main()
