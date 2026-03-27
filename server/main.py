"""Zuri AI Concierge — FastAPI Backend Server."""

import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS, ENV
from app.core.database import init_db
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

app = FastAPI(
    title="Zuri AI Concierge",
    description="RAG-powered backend for the Zuri hospitality AI platform",
    version="1.0.0",
)

# Static files for the widget
# Ensure the directory exists
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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



@app.on_event("startup")
def on_startup():
    init_db()


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


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
