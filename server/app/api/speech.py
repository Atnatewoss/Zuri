"""Speech endpoints for widget voice fallback."""

from fastapi import APIRouter, File, Form, HTTPException, Response, UploadFile

from app.models.schemas import SpeechSynthesisRequest, SpeechTranscriptionResponse
from app.services.speech_service import synthesize_speech, transcribe_audio

router = APIRouter(prefix="/api/speech", tags=["Speech"])


@router.post("/transcribe", response_model=SpeechTranscriptionResponse)
async def transcribe_audio_endpoint(
    audio: UploadFile = File(...),
    language: str | None = Form(default=None),
):
    """Transcribe uploaded speech audio using Gemini."""
    if not audio.content_type or not audio.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="audio file is required")

    data = await audio.read()
    if not data:
        raise HTTPException(status_code=400, detail="audio file is empty")

    text = transcribe_audio(data, audio.content_type, language)
    if not text:
        raise HTTPException(status_code=502, detail="Unable to transcribe audio right now")

    return SpeechTranscriptionResponse(text=text)


@router.post("/synthesize")
async def synthesize_audio_endpoint(request: SpeechSynthesisRequest):
    """Synthesize speech audio using Gemini TTS and return a WAV payload."""
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="text is required")

    audio_bytes = synthesize_speech(request.text, request.language)
    if not audio_bytes:
        raise HTTPException(status_code=502, detail="Unable to synthesize speech right now")

    return Response(content=audio_bytes, media_type="audio/wav")
