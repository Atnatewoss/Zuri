"""Dynamic CORS Middleware — Allows origins based on per-tenant allowed_domains."""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlmodel import Session, select
import logging

from app.core.config import CORS_ORIGINS, ENV
from app.core.database import engine
from app.models.schemas import ResortSettings

logger = logging.getLogger(__name__)

class DynamicCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("Origin")
        if not origin:
            return await call_next(request)

        # 1. Check static CORS_ORIGINS (e.g., the panel)
        if origin in CORS_ORIGINS:
            response = await self._handle_request(request, call_next, origin)
            return response

        # 2. Check dynamic origins for the widget
        # We look for X-Zuri-Hotel-Id header which the widget sends
        hotel_id = request.headers.get("X-Zuri-Hotel-Id")
        
        # Also check query params as a fallback for some widget requests
        if not hotel_id:
            hotel_id = request.query_params.get("hotel_id")

        if hotel_id:
            if await self._is_origin_allowed(hotel_id, origin):
                return await self._handle_request(request, call_next, origin)

        # 3. Default behavior: if it's an OPTIONS request, we must return a response
        if request.method == "OPTIONS":
            # If not allowed, we still need to return a response but without the allow header
            return Response(status_code=204)

        # For other methods, just proceed (default CORS block by browser will happen)
        return await call_next(request)

    async def _is_origin_allowed(self, hotel_id: str, origin: str) -> bool:
        """Check if the origin is in the resort's allowed_domains list."""
        try:
            with Session(engine) as session:
                resort = session.exec(
                    select(ResortSettings).where(ResortSettings.hotel_id == hotel_id)
                ).first()
                
                if not resort or not resort.allowed_domains:
                    return False

                # Basic normalization
                clean_origin = origin.strip().lower().rstrip("/")
                protocol = "http://" if ENV == "development" else "https://"
                
                allowed_list = []
                for d in resort.allowed_domains.split(","):
                    d = d.strip().lower().rstrip("/")
                    if not d: continue
                    if not d.startswith("http://") and not d.startswith("https://"):
                        d = protocol + d
                    allowed_list.append(d)
                
                return clean_origin in allowed_list
        except Exception as e:
            logger.error(f"Error checking dynamic CORS for hotel {hotel_id}: {e}")
            return False

    async def _handle_request(self, request, call_next, allowed_origin):
        if request.method == "OPTIONS":
            response = Response(status_code=204)
        else:
            response = await call_next(request)

        response.headers["Access-Control-Allow-Origin"] = allowed_origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response
