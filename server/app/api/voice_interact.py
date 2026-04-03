"""Optimized voice interaction endpoint - eliminates Waterfall Latency."""

import base64
import json
import logging
import time

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from sqlmodel import Session

from app.core.database import get_session
from app.models.schemas import VoiceInteractionResponse
from app.services.chat_service import chat
from app.services.speech_service import synthesize_speech, transcribe_audio

router = APIRouter(prefix="/api/voice", tags=["Voice"])
logger = logging.getLogger(__name__)


@router.post("/interact", response_model=VoiceInteractionResponse)
async def voice_interact_endpoint(
    audio: UploadFile = File(...),
    hotel_id: str = Form(...),
    language: str | None = Form(default="en-US"),
    conversation_history_json: str | None = Form(default="[]"),
    session: Session = Depends(get_session),
):
    """
    Perform a complete voice interaction in one server-side pass.
    1. Transcribe (STT)
    2. Answer (RAG Chat)
    3. Synthesize (TTS)
    """
    start_time = time.perf_counter()

    # 1. Validate Audio
    if not audio.content_type or not audio.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="audio file is required")
    audio_data = await audio.read()
    if not audio_data:
        raise HTTPException(status_code=400, detail="audio file is empty")

    # 2. Parse History
    try:
        history = json.loads(conversation_history_json or "[]")
    except Exception:
        history = []

    # 3. Transcribe
    stt_start = time.perf_counter()
    user_text = transcribe_audio(audio_data, audio.content_type, language)
    stt_duration = time.perf_counter() - stt_start
    if not user_text:
        raise HTTPException(status_code=502, detail="Transcription failed")

    # 4. Chat
    chat_start = time.perf_counter()
    chat_result = chat(
        message=user_text,
        hotel_id=hotel_id,
        language=language,
        conversation_history=history,
        session=session,
    )
    ai_text = chat_result["response"]
    chat_duration = time.perf_counter() - chat_start

    # 5. Synthesize
    tts_start = time.perf_counter()
    audio_bytes = synthesize_speech(ai_text, language)
    tts_duration = time.perf_counter() - tts_start
    if not audio_bytes:
        raise HTTPException(status_code=502, detail="Synthesis failed")

    # 6. Encode and Return
    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
    total_duration = time.perf_counter() - start_time

    logger.info(
        "voice_interact finished hotel_id=%s total=%.2fs (stt=%.2f, chat=%.2f, tts=%.2f)",
        hotel_id,
        total_duration,
        stt_duration,
        chat_duration,
        tts_duration,
    )

    return VoiceInteractionResponse(
        user_text=user_text,
        ai_text=ai_text,
        audio_base64=audio_b64,
    )
