"""Speech helpers powered by Gemini audio understanding."""

import io
import logging
import time
import wave

from google import genai
from google.genai import types

from app.core.config import GEMINI_API_KEY, GEMINI_AUDIO_MODEL, GEMINI_TTS_MODEL

logger = logging.getLogger(__name__)
_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def transcribe_audio(audio_bytes: bytes, mime_type: str, language_hint: str | None = None) -> str:
    """Transcribe uploaded speech audio to plain text."""
    start_time = time.perf_counter()
    prompt = (
        "Return the EXACT transcription of this speech in plain text. "
        "NO filler, NO commentary, NO meta-tags. Return ONLY the spoken words."
    )
    if language_hint:
        prompt += f"The likely spoken language is {language_hint}. "

    logger.debug(
        "transcribe_audio starting model=%s mime_type=%s lang=%s",
        GEMINI_AUDIO_MODEL,
        mime_type,
        language_hint,
    )

    client = _get_client()
    try:
        response = client.models.generate_content(
            model=GEMINI_AUDIO_MODEL,
            contents=[
                prompt,
                types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
            ],
            config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=512,
            ),
        )
        text = (response.text or "").strip()
        duration = time.perf_counter() - start_time
        logger.info(
            "transcribe_audio finished duration=%.2fs text=%s",
            duration,
            text,
        )
        return text
    except Exception as exc:
        logger.error("transcribe_audio failed", exc_info=exc)
        return ""


LANGUAGE_VOICE_MAP = {
    "arabic": "Kore",
    "amharic": "Kore",
    "tigrinya": "Kore",
    "oromifa": "Kore",  # Kore is generally more stable for regional dialects
    "somali": "Puck",
    "english": "Kore",
    "french": "Kore",
    "italian": "Puck",
}


def _pcm_to_wav(pcm_data: bytes, sample_rate: int = 24000, channels: int = 1, sample_width: int = 2) -> bytes:
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(sample_width)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_data)
    return buffer.getvalue()


def synthesize_speech(text: str, language_hint: str | None = None) -> bytes:
    """Synthesize speech audio from text and return WAV bytes."""
    start_time = time.perf_counter()
    clean_text = (text or "").strip()
    if not clean_text:
        return b""

    language_name = (language_hint or "English").strip()
    voice_name = LANGUAGE_VOICE_MAP.get(language_name.lower(), "Kore")
    
    # Senior Prompt: Add tone and naturalness constraints
    prompt = (
        f"Generate a professional, warm, and natural audio reading of the following text in {language_name}. "
        f"Ensure correct pronunciation and cadence. Text: {clean_text}"
    )

    logger.debug(
        "synthesize_speech starting model=%s lang=%s voice=%s",
        GEMINI_TTS_MODEL,
        language_name,
        voice_name,
    )

    client = _get_client()
    try:
        response = client.models.generate_content(
            model=GEMINI_TTS_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice_name)
                    )
                ),
            ),
        )

        pcm_data = response.candidates[0].content.parts[0].inline_data.data
        wav_data = _pcm_to_wav(pcm_data)
        duration = time.perf_counter() - start_time
        logger.info(
            "synthesize_speech finished duration=%.2fs size=%d",
            duration,
            len(wav_data),
        )
        return wav_data
    except Exception as exc:
        logger.error("synthesize_speech failed", exc_info=exc)
        return b""
