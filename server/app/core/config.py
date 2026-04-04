"""Application configuration loaded from environment variables."""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# --- Runtime ---
ENV = os.getenv("ENV", "development")

# --- Paths ---
BASE_DIR = Path(__file__).resolve().parent.parent.parent
TEMP_UPLOAD_DIR = Path(os.getenv("TEMP_UPLOAD_DIR", str(BASE_DIR / "_tmp_uploads")))
TEMP_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# --- Database (Supabase PostgreSQL) ---
DATABASE_URL = os.getenv("DATABASE_URL", "")

# --- ChromaDB Cloud ---
CHROMA_API_KEY = os.getenv("CHROMA_API_KEY", "")
CHROMA_TENANT = os.getenv("CHROMA_TENANT", "")
CHROMA_DATABASE = os.getenv("CHROMA_DATABASE", "Zuri")

# --- AI APIs ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ADDISAI_API_KEY = os.getenv("ADDISAI_API_KEY", "")
GEMINI_CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-2.5-flash")
GEMINI_EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001")
GEMINI_AUDIO_MODEL = os.getenv("GEMINI_AUDIO_MODEL", "gemini-3-flash-preview")
GEMINI_TTS_MODEL = os.getenv("GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts")
GEMINI_LIVE_MODEL = os.getenv("GEMINI_LIVE_MODEL", "models/gemini-2.5-flash-native-audio-latest")

# --- CORS ---
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]

# --- RAG ---
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "500"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))
TOP_K_RESULTS = int(os.getenv("TOP_K_RESULTS", "5"))
RAG_MAX_CONTEXT_CHARS = int(os.getenv("RAG_MAX_CONTEXT_CHARS", "3500"))
CHAT_HISTORY_WINDOW = int(os.getenv("CHAT_HISTORY_WINDOW", "8"))

# --- Auth ---
APP_SECRET_KEY = os.getenv("APP_SECRET_KEY", "dev-insecure-change-me")
if ENV == "production":
    if APP_SECRET_KEY == "dev-insecure-change-me":
        raise ValueError("FATAL: Insecure APP_SECRET_KEY default used in production environment.")
    if len(APP_SECRET_KEY) < 32:
        raise ValueError("FATAL: APP_SECRET_KEY must be at least 32 characters in production.")

SESSION_TOKEN_TTL_SECONDS = int(os.getenv("SESSION_TOKEN_TTL_SECONDS", "86400"))

# --- Abuse Controls ---
CHAT_RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("CHAT_RATE_LIMIT_WINDOW_SECONDS", "60"))
CHAT_RATE_LIMIT_MAX_REQUESTS = int(os.getenv("CHAT_RATE_LIMIT_MAX_REQUESTS", "20"))
CHAT_MAX_MESSAGE_LENGTH = int(os.getenv("CHAT_MAX_MESSAGE_LENGTH", "5000"))

# Public booking cancellation abuse controls
BOOKING_CANCEL_RATE_LIMIT_WINDOW_SECONDS = int(
    os.getenv("BOOKING_CANCEL_RATE_LIMIT_WINDOW_SECONDS", "300")
)
BOOKING_CANCEL_RATE_LIMIT_MAX_REQUESTS = int(
    os.getenv("BOOKING_CANCEL_RATE_LIMIT_MAX_REQUESTS", "8")
)
BOOKING_CANCEL_CODE_RATE_LIMIT_WINDOW_SECONDS = int(
    os.getenv("BOOKING_CANCEL_CODE_RATE_LIMIT_WINDOW_SECONDS", "600")
)
BOOKING_CANCEL_CODE_RATE_LIMIT_MAX_REQUESTS = int(
    os.getenv("BOOKING_CANCEL_CODE_RATE_LIMIT_MAX_REQUESTS", "5")
)

# In-memory CORS cache
CORS_CACHE_TTL_SECONDS = int(os.getenv("CORS_CACHE_TTL_SECONDS", "60"))
