"""Zuri AI Concierge - FastAPI Backend Server."""

import os
import logging
import uvicorn
from fastapi import FastAPI

from app.core.config import ENV
# from app.core.database import init_db (removed for Alembic)
from app.core.middleware import DynamicCORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.knowledge import router as knowledge_router
from app.api.chat import router as chat_router
from app.api.services import router as services_router
from app.api.bookings import router as bookings_router
from app.api.dashboard import router as dashboard_router
from app.api.settings import router as settings_router
from app.api.embed import router as embed_router
from app.api.resorts import router as resorts_router
from app.api.generator import router as generator_router
from app.api.auth import router as auth_router
from app.api.speech import router as speech_router
from app.api.live_voice import router as live_voice_router
from app.api.voice_interact import router as voice_interact_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Zuri AI Concierge",
    description="RAG-powered backend for the Zuri hospitality AI platform",
    version="1.0.0",
)

# Static files for the widget
# Ensure the directory exists
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Dynamic CORS (Handles static CORS_ORIGINS + tenant-specific allowed_domains)
app.add_middleware(DynamicCORSMiddleware)

# Register routers
app.include_router(knowledge_router)
app.include_router(chat_router)
app.include_router(services_router)
app.include_router(bookings_router)
app.include_router(dashboard_router)
app.include_router(settings_router)
app.include_router(embed_router)
app.include_router(resorts_router)
app.include_router(generator_router)
app.include_router(auth_router)
app.include_router(speech_router)
app.include_router(live_voice_router)


# Removed startup db initialization for Alembic


@app.get("/")
def root():
    return {
        "name": "Zuri AI Concierge",
        "version": "1.0.0",
        "status": "operational",
    }


@app.get("/health")
def health():
    return {"status": "healthy", "environment": ENV}

@app.on_event("startup")
def startup_checks():
    """Emit operational warnings for in-memory controls in multi-process mode."""
    worker_hint = (
        os.getenv("UVICORN_WORKERS")
        or os.getenv("WEB_CONCURRENCY")
        or os.getenv("GUNICORN_WORKERS")
        or "1"
    )
    try:
        workers = int(worker_hint)
    except ValueError:
        workers = 1

    if workers > 1:
        logger.warning(
            "Running with %s workers: in-memory rate limits and CORS caches are process-local.",
            workers,
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
