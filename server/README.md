# Zuri Backend (FastAPI)

This is the core engine for Zuri AI Concierge. It provides a multi-tenant RAG (Retrieval-Augmented Generation) pipeline, secures guest interactions, and manages resort metadata.

## Core Services

- **Knowledge Service**: Asynchronous document ingestion (PDF, DOCX, TXT) into ChromaDB Cloud.
- **Chat Service**: RAG-powered Q&A using Google Gemini 2.0 Flash.
- **Management API**: Secure endpoints for bookings, services, and rooms, protected by JWT.
- **Rate Limiter**: In-memory sliding window rate limiting.

## Installation & Setup

1. **Install UV** (High-performance Python package manager):
   ```bash
   # Windows (PowerShell)
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

2. **Sync Dependencies**:
   ```bash
   uv sync
   ```

3. **Environment Setup**:
   Copy `.env.example` to `.env` and fill in the required keys:
   - `DATABASE_URL`: Supabase PostgreSQL connection string.
   - `GEMINI_API_KEY`: API key from Google AI Studio.
   - `CHROMA_API_KEY`: API key for ChromaDB Cloud/Managed.

4. **Run the Server**:
   ```bash
   uv run uvicorn main:app --reload
   ```

## Database Migrations

This project uses **SQLModel** and is set up for **Alembic** migrations.
- To initialize a new migration: `uv run alembic revision --autogenerate -m "description"`
- To apply migrations: `uv run alembic upgrade head`

> [!IMPORTANT]
> Since the remediation, `SQLModel.metadata.create_all` is disabled. You **must** use Alembic to manage schema changes.

## Security Features

- **X-Zuri-Hotel-Id Header**: The widget must send this header to bypass CORS restrictions on its allowed domain.
- **JWT Authentication**: Secured using HMAC-SHA256 with `jti`, `iss`, and `aud` claims.
- **IDOR Protection**: All endpoints use the `get_authenticated_hotel_id` dependency to verify tenant context.

## Performance Notes

- **Background Tasks**: Document processing is non-blocking. Monitor terminal logs to see ingestion status.
- **Query Optimization**: Dashboard stats use bulk aggregation to scale with high message volumes.
