"""SQLModel database engine and session management (Supabase PostgreSQL)."""

from sqlmodel import SQLModel, Session, create_engine
from app.core.config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)


# Removed init_db() as Alembic handles schema migrations via `alembic upgrade head`


def get_session():
    """FastAPI dependency that yields a database session."""
    with Session(engine) as session:
        yield session
