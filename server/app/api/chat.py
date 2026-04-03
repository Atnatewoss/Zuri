"""Chat API — RAG-powered guest Q&A endpoint."""
import logging
import time

logger = logging.getLogger(__name__)

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.config import (
    CHAT_MAX_MESSAGE_LENGTH,
    CHAT_RATE_LIMIT_MAX_REQUESTS,
    CHAT_RATE_LIMIT_WINDOW_SECONDS,
)
from app.core.origin import is_origin_allowed, origin_from_headers
from app.core.rate_limit import chat_rate_limiter
from app.models.schemas import ChatRequest, ChatResponse, ResortSettings
from app.services.chat_service import chat

router = APIRouter(prefix="/api", tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(
    request: ChatRequest,
    http_request: Request,
    x_zuri_hotel_id: str | None = Header(default=None),
    session: Session = Depends(get_session),
):
    """Send a guest message and receive an AI concierge response powered by RAG."""
    hotel_id = request.hotel_id or x_zuri_hotel_id
    if not hotel_id:
        raise HTTPException(status_code=400, detail="hotel_id is required")
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="message is required")
    if len(request.message) > CHAT_MAX_MESSAGE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"message too long (max {CHAT_MAX_MESSAGE_LENGTH} chars)",
        )

    exists = session.exec(
        select(ResortSettings).where(ResortSettings.hotel_id == hotel_id)
    ).first()
    if not exists:
        raise HTTPException(status_code=404, detail="Resort not found")

    # Validate Origin
    origin = origin_from_headers(
        http_request.headers.get("origin"),
        http_request.headers.get("referer"),
    )
    allowed = is_origin_allowed(exists.allowed_domains, origin) if exists.allowed_domains else True
    if exists.allowed_domains and not allowed:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Origin not allowed for this resort's widget.",
        )

    client_ip = (http_request.client.host if http_request.client else "unknown").strip()
    rate_limit_key = f"{hotel_id}:{client_ip}"
    allowed = chat_rate_limiter.allow(
        key=rate_limit_key,
        max_requests=CHAT_RATE_LIMIT_MAX_REQUESTS,
        window_seconds=CHAT_RATE_LIMIT_WINDOW_SECONDS,
    )
    if not allowed:
        raise HTTPException(status_code=429, detail="Too many requests, please slow down")

    try:
        start_time = time.perf_counter()
        result = chat(
            message=request.message,
            hotel_id=hotel_id,
            language=request.language,
            conversation_history=request.conversation_history,
            session=session,
        )
        duration = time.perf_counter() - start_time
        logger.info(
            "chat_endpoint finished hotel_id=%s duration=%.2fs response_len=%d",
            hotel_id,
            duration,
            len(result["response"]),
        )
    except Exception as e:
        logger.error(f"Chat error for hotel {hotel_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="We could not process your request at this time. Please try again shortly.",
        )
    return ChatResponse(
        response=result["response"],
        sources=result["sources"],
    )
