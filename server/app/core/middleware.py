"""Dynamic CORS Middleware — Allows origins based on per-tenant allowed_domains."""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlmodel import Session, select
import logging
import threading
import time

from app.core.config import CORS_ORIGINS, CORS_CACHE_TTL_SECONDS
from app.core.database import engine
from app.core.origin import (
    is_development_loopback_origin,
    normalize_allowed_domains,
    normalize_origin,
)
from app.models.schemas import ResortSettings

logger = logging.getLogger(__name__)

_cache_lock = threading.Lock()
_hotel_origin_cache: dict[str, tuple[float, set[str]]] = {}
_global_origin_cache: tuple[float, set[str]] = (0.0, set())
ALLOWED_CORS_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
ALLOWED_CORS_HEADERS = "Content-Type, Authorization, X-Zuri-Hotel-Id"


class DynamicCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("Origin")
        if not origin:
            return await call_next(request)

        # 1. Check static CORS_ORIGINS (e.g., the panel)
        if origin in CORS_ORIGINS:
            return await self._handle_request(request, call_next, origin)

        # 2. Check dynamic origins for the widget
        # The widget sends X-Zuri-Hotel-Id header on real requests,
        # but browser preflight OPTIONS requests do NOT carry custom headers.
        hotel_id = request.headers.get("X-Zuri-Hotel-Id")

        # Always check query params as fallback (works for both OPTIONS and real requests)
        if not hotel_id:
            hotel_id = request.query_params.get("hotel_id")

        if hotel_id:
            if await self._is_origin_allowed(hotel_id, origin):
                return await self._handle_request(request, call_next, origin)

        # 3. For OPTIONS preflight without hotel_id (browser strips custom headers),
        #    check if ANY resort has this origin in its allowed_domains.
        if request.method == "OPTIONS":
            if await self._is_origin_allowed_any_resort(origin):
                return await self._handle_request(request, call_next, origin)
            return Response(status_code=204)

        # For other methods, just proceed (default CORS block by browser will happen)
        return await call_next(request)

    async def _is_origin_allowed(self, hotel_id: str, origin: str) -> bool:
        """Check if the origin is in the resort's allowed_domains list."""
        try:
            if is_development_loopback_origin(origin):
                return True

            clean_origin = normalize_origin(origin)
            now = time.time()

            with _cache_lock:
                cached = _hotel_origin_cache.get(hotel_id)
                if cached and cached[0] > now:
                    return clean_origin in cached[1]

            with Session(engine) as session:
                resort = session.exec(
                    select(ResortSettings).where(ResortSettings.hotel_id == hotel_id)
                ).first()

            if not resort or not resort.allowed_domains:
                with _cache_lock:
                    _hotel_origin_cache[hotel_id] = (now + CORS_CACHE_TTL_SECONDS, set())
                return False

            allowed_set = normalize_allowed_domains(resort.allowed_domains)
            with _cache_lock:
                _hotel_origin_cache[hotel_id] = (now + CORS_CACHE_TTL_SECONDS, allowed_set)
            return clean_origin in allowed_set
        except Exception as e:
            logger.error(f"Error checking dynamic CORS for hotel {hotel_id}: {e}")
            return False

    async def _is_origin_allowed_any_resort(self, origin: str) -> bool:
        """Fallback for OPTIONS preflight: check if ANY resort allows this origin."""
        try:
            if is_development_loopback_origin(origin):
                return True

            global _global_origin_cache
            clean_origin = normalize_origin(origin)
            now = time.time()

            with _cache_lock:
                cache_expires, cached_origins = _global_origin_cache
                if cache_expires > now:
                    return clean_origin in cached_origins

            with Session(engine) as session:
                resorts = session.exec(select(ResortSettings)).all()

            all_origins: set[str] = set()
            for resort in resorts:
                if not resort.allowed_domains:
                    continue
                all_origins.update(normalize_allowed_domains(resort.allowed_domains))

            with _cache_lock:
                _global_origin_cache = (now + CORS_CACHE_TTL_SECONDS, all_origins)
            return clean_origin in all_origins
        except Exception as e:
            logger.error(f"Error checking broad CORS: {e}")
            return False

    async def _handle_request(self, request, call_next, allowed_origin):
        if request.method == "OPTIONS":
            response = Response(status_code=204)
        else:
            response = await call_next(request)

        response.headers["Access-Control-Allow-Origin"] = allowed_origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = ALLOWED_CORS_METHODS
        response.headers["Access-Control-Allow-Headers"] = ALLOWED_CORS_HEADERS
        response.headers["Vary"] = "Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
        return response
