"""Chat API — RAG-powered guest Q&A endpoint."""

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.config import (
    CHAT_MAX_MESSAGE_LENGTH,
    CHAT_RATE_LIMIT_MAX_REQUESTS,
    CHAT_RATE_LIMIT_WINDOW_SECONDS,
)
from app.core.rate_limit import SlidingWindowRateLimiter
from app.models.schemas import ChatRequest, ChatResponse, ResortSettings
from app.services.chat_service import chat

router = APIRouter(prefix="/api", tags=["Chat"])
_chat_rate_limiter = SlidingWindowRateLimiter()


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

    client_ip = (http_request.client.host if http_request.client else "unknown").strip()
    rate_limit_key = f"{hotel_id}:{client_ip}"
    allowed = _chat_rate_limiter.allow(
        key=rate_limit_key,
        max_requests=CHAT_RATE_LIMIT_MAX_REQUESTS,
        window_seconds=CHAT_RATE_LIMIT_WINDOW_SECONDS,
    )
    if not allowed:
        raise HTTPException(status_code=429, detail="Too many requests, please slow down")

    result = chat(
        message=request.message,
        hotel_id=hotel_id,
        session=session,
    )
    return ChatResponse(
        response=result["response"],
        sources=result["sources"],
    )
