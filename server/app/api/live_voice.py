"""Realtime voice WebSocket proxy for the widget."""

import asyncio
import base64
import json
import logging
from typing import Any
from urllib.parse import unquote

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from sqlmodel import Session, select

from app.core.config import GEMINI_API_KEY, GEMINI_LIVE_MODEL
from app.core.database import engine
from app.core.origin import is_origin_allowed, origin_from_headers
from app.models.schemas import ResortSettings
from app.rag.booking_tools import (
    book_item,
    get_available_time_slots,
    get_room_availability,
    get_service_list,
)
from app.rag.vector_store import query as vector_query

router = APIRouter(tags=["Live Voice"])
logger = logging.getLogger(__name__)

_client: genai.Client | None = None
LIVE_MODEL_FALLBACKS = [
    GEMINI_LIVE_MODEL,
    "models/gemini-2.5-flash-native-audio-latest",
    "models/gemini-3.1-flash-live-preview",
]

LIVE_LANGUAGE_INSTRUCTIONS = {
    "oromifa": (
        "STRICTLY use Afaan Oromoo. You are NOT speaking Amharic or Tigrinya. "
        "Speak naturally with native Oromo cadence."
    ),
    "tigrinya": (
        "You MUST speak in Tigrinya (ትግርኛ), NOT Amharic. "
        "These are DIFFERENT languages. Use Tigrinya-specific vocabulary. "
        "Speak with a warm, measured, and professional Tigrinya cadence."
    ),
    "somali": (
        "You MUST speak in Somali (af-Soomaali), NOT Oromo/Oromifa. "
        "These are DIFFERENT languages. Use Somali-specific vocabulary. "
        "Be clear, concise, and helpful."
    ),
    "amharic": "Use formal Amharic. You are NOT speaking Tigrinya.",
    "arabic": "Use professional Modern Standard Arabic.",
}

LIVE_SYSTEM_PROMPT = """You are Zuri, a senior AI concierge for a luxury resort.

VOICE EXPERIENCE RULES:
- Respond naturally for spoken conversation.
- Keep answers concise, clear, and helpful unless the guest asks for more detail.
- If asked factual resort questions, call `search_resort_knowledge` first.
- For bookings, always use the booking tools before confirming anything.
- If required booking fields are missing, ask only for the missing details.
- After a successful booking, clearly state the confirmation code.
- Speak entirely and ONLY in {language}.
{language_instruction}
{history}
"""


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def _validate_websocket_tenant(websocket: WebSocket, hotel_id: str) -> bool:
    with Session(engine) as session:
        settings = session.exec(
            select(ResortSettings).where(ResortSettings.hotel_id == hotel_id)
        ).first()
        if not settings:
            return False

        origin = origin_from_headers(
            websocket.headers.get("origin"),
            websocket.headers.get("referer"),
        )
        if settings.allowed_domains and not is_origin_allowed(settings.allowed_domains, origin):
            return False
    return True


def _search_resort_knowledge(question: str, hotel_id: str) -> dict[str, Any]:
    search_results = vector_query(question, hotel_id)
    docs = search_results["documents"][0] if search_results["documents"] else []
    metadatas = search_results["metadatas"][0] if search_results["metadatas"] else []

    snippets: list[dict[str, str]] = []
    for doc, meta in zip(docs[:4], metadatas[:4]):
        snippets.append(
            {
                "source": meta.get("filename", "Unknown"),
                "snippet": str(doc or "").strip()[:900],
            }
        )
    return {"results": snippets}


@router.websocket("/api/live-voice/ws")
async def live_voice_websocket(
    websocket: WebSocket,
):
    hotel_id = (websocket.query_params.get("hotel_id") or "").strip()
    language = (websocket.query_params.get("language") or "English").strip()
    history_param = (websocket.query_params.get("history") or "").strip()

    if not hotel_id:
        await websocket.close(code=4400, reason="hotel_id is required")
        return

    if not _validate_websocket_tenant(websocket, hotel_id):
        await websocket.close(code=4403, reason="forbidden")
        return

    await websocket.accept()

    client = _get_client()
    history_block = ""
    if history_param:
        try:
            history_payload = base64.b64decode(unquote(history_param)).decode("utf-8")
            history_items = json.loads(history_payload)
            if isinstance(history_items, list) and history_items:
                formatted_turns = []
                for turn in history_items[-6:]:
                    role = "Assistant" if turn.get("role") == "model" else "Guest"
                    text = str(turn.get("text") or "").strip()
                    if text:
                        formatted_turns.append(f"{role}: {text}")
                if formatted_turns:
                    history_block = "\nRECENT CONVERSATION:\n" + "\n".join(formatted_turns)
        except Exception:
            history_block = ""

    def search_resort_knowledge(question: str) -> dict[str, Any]:
        return _search_resort_knowledge(question, hotel_id)

    def list_available_rooms() -> list:
        return get_room_availability(hotel_id)

    def list_resort_services() -> list:
        return get_service_list(hotel_id)

    def list_available_time_slots_for_item(item_name: str, date: str) -> list:
        return get_available_time_slots(hotel_id, item_name, date)

    def perform_booking(guest_name: str, item_name: str, date: str, time: str) -> dict:
        return book_item(hotel_id, guest_name, item_name, date, time)

    tool_map = {
        "search_resort_knowledge": search_resort_knowledge,
        "list_available_rooms": list_available_rooms,
        "list_resort_services": list_resort_services,
        "list_available_time_slots_for_item": list_available_time_slots_for_item,
        "perform_booking": perform_booking,
    }

    def _get_live_language_instruction(language: str) -> str:
        lang_key = (language or "english").strip().lower()
        return f"- {LIVE_LANGUAGE_INSTRUCTIONS[lang_key]}" if lang_key in LIVE_LANGUAGE_INSTRUCTIONS else ""

    connect_config = types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        system_instruction=LIVE_SYSTEM_PROMPT.format(
            language=language,
            language_instruction=_get_live_language_instruction(language),
            history=history_block
        ),
        tools=list(tool_map.values()),
        input_audio_transcription=types.AudioTranscriptionConfig(),
        output_audio_transcription=types.AudioTranscriptionConfig(),
        realtime_input_config=types.RealtimeInputConfig(
            automatic_activity_detection=types.AutomaticActivityDetection(disabled=False)
        ),
    )

    last_error: Exception | None = None
    try:
        for model_name in dict.fromkeys(LIVE_MODEL_FALLBACKS):
            try:
                async with client.aio.live.connect(
                    model=model_name,
                    config=connect_config,
                ) as session:
                    logger.info("live voice connected hotel_id=%s model=%s", hotel_id, model_name)

                    async def browser_to_gemini() -> None:
                        try:
                            while True:
                                raw = await websocket.receive_text()
                                message = json.loads(raw)
                                message_type = message.get("type")

                                if message_type == "audio":
                                    audio_bytes = base64.b64decode(message["data"])
                                    await session.send(
                                        input=types.LiveClientRealtimeInput(
                                            audio=types.Blob(
                                                data=audio_bytes,
                                                mime_type="audio/pcm;rate=16000",
                                            )
                                        )
                                    )
                                elif message_type == "end":
                                    await session.send(
                                        input=types.LiveClientRealtimeInput(audio_stream_end=True)
                                    )
                                elif message_type == "close":
                                    break
                        except WebSocketDisconnect:
                            logger.info("live voice browser disconnect hotel_id=%s", hotel_id)
                        except Exception as exc:
                            logger.exception("live voice browser->gemini failure hotel_id=%s", hotel_id, exc_info=exc)
                            raise

                    async def gemini_to_browser() -> None:
                        try:
                            async for response in session.receive():
                                if response.setup_complete:
                                    logger.info("live voice setup complete hotel_id=%s model=%s", hotel_id, model_name)
                                    await websocket.send_json({"type": "setup_complete"})
                                    continue

                                if response.tool_call and response.tool_call.function_calls:
                                    function_responses = []
                                    for call in response.tool_call.function_calls:
                                        tool = tool_map.get(call.name)
                                        result = tool(**(call.args or {})) if tool else {"error": "Unknown tool"}
                                        function_responses.append(
                                            types.FunctionResponse(
                                                id=call.id,
                                                name=call.name,
                                                response=result,
                                            )
                                        )
                                    await session.send_tool_response(function_responses=function_responses)

                                server_content = response.server_content
                                if server_content:
                                    logger.debug(
                                        "live voice server content hotel_id=%s input=%s output=%s turn_complete=%s interrupted=%s",
                                        hotel_id,
                                        bool(server_content.input_transcription and server_content.input_transcription.text),
                                        bool(server_content.output_transcription and server_content.output_transcription.text),
                                        bool(server_content.turn_complete),
                                        bool(server_content.interrupted),
                                    )

                                    if server_content.input_transcription:
                                        logger.debug(
                                            "live voice input_transcription hotel_id=%s text=%s finished=%s",
                                            hotel_id,
                                            server_content.input_transcription.text,
                                            bool(server_content.input_transcription.finished),
                                        )
                                        await websocket.send_json(
                                            {
                                                "type": "input_transcript",
                                                "text": server_content.input_transcription.text or "",
                                                "finished": bool(server_content.input_transcription.finished),
                                            }
                                        )

                                    if server_content.output_transcription:
                                        logger.debug(
                                            "live voice output_transcription hotel_id=%s text=%s finished=%s",
                                            hotel_id,
                                            server_content.output_transcription.text,
                                            bool(server_content.output_transcription.finished),
                                        )
                                        await websocket.send_json(
                                            {
                                                "type": "output_transcript",
                                                "text": server_content.output_transcription.text or "",
                                                "finished": bool(server_content.output_transcription.finished),
                                            }
                                        )

                                    if server_content.model_turn and server_content.model_turn.parts:
                                        for part in server_content.model_turn.parts:
                                            if not part.inline_data or not part.inline_data.data:
                                                continue
                                            await websocket.send_json(
                                                {
                                                    "type": "audio",
                                                    "data": base64.b64encode(part.inline_data.data).decode("ascii"),
                                                    "mimeType": part.inline_data.mime_type or "audio/pcm;rate=24000",
                                                }
                                            )

                                    if server_content.turn_complete:
                                        await websocket.send_json({"type": "turn_complete"})
                        except Exception as exc:
                            logger.exception("live voice gemini->browser failure hotel_id=%s", hotel_id, exc_info=exc)
                            raise

                    await asyncio.gather(browser_to_gemini(), gemini_to_browser())
                    return
            except genai_errors.APIError as error:
                last_error = error
                logger.warning("live voice connect failed for model=%s error=%s", model_name, error)
                continue
    except WebSocketDisconnect:
        logger.info("live voice websocket disconnected hotel_id=%s", hotel_id)
        return
    except Exception as error:
        last_error = error
        logger.error("live voice websocket failed hotel_id=%s error=%s", hotel_id, error, exc_info=True)

    logger.error("live voice unavailable hotel_id=%s last_error=%s", hotel_id, last_error)
    await websocket.send_json({"type": "error", "message": "Live voice is unavailable right now."})
    await websocket.close()
