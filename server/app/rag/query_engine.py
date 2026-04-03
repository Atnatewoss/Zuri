import logging
import time

from google import genai
from app.core.config import (
    CHAT_HISTORY_WINDOW,
    GEMINI_API_KEY,
    GEMINI_CHAT_MODEL,
    RAG_MAX_CONTEXT_CHARS,
)
from app.rag.vector_store import query as vector_query
from app.rag.booking_tools import (
    get_room_availability,
    get_service_list,
    get_available_time_slots,
    book_item,
)

_client = None
logger = logging.getLogger(__name__)


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


LANGUAGE_INSTRUCTIONS = {
    "oromifa": (
        "STRICTLY use Latin (Qubee) script for Afaan Oromoo. "
        "NEVER use Ge'ez/Amharic/Tigrinya characters. "
        "You are NOT speaking Amharic or Tigrinya. "
        "Example greeting: 'Akkam jirtu! Baga nagaan dhuftan. Maal isin gargaaruu dandeenya?'"
    ),
    "tigrinya": (
        "You MUST respond in Tigrinya (ትግርኛ), NOT Amharic. "
        "These are DIFFERENT languages. Use Tigrinya-specific vocabulary and grammar. "
        "Key Tigrinya words: ከመይ (how), ኣሎ (there is), ክንዮ (beyond), ንኽእል (we can), ሓጋዚ (helper). "
        "Example: 'ሰላም! ናብ ሪዞርትና እንቋዕ ብደሓን መጻእኩም። ብኸመይ ክሕግዘኩም ይኽእል?'"
    ),
    "somali": (
        "You MUST respond in Somali (af-Soomaali), NOT Oromo/Oromifa. "
        "These are DIFFERENT languages. Use Somali-specific vocabulary and grammar. "
        "Key Somali words: maxay (what), waxaan (I am), fadlan (please), mahadsanid (thank you). "
        "Example: 'Soo dhawoow! Ku soo dhawoow resortkeenna. Sidee kugu caawin karaa?'"
    ),
    "amharic": "Use formal Amharic (Ge'ez script). You are NOT speaking Tigrinya.",
    "arabic": "Use professional Modern Standard Arabic (Right-to-Left script).",
}

SYSTEM_PROMPT = """You are Zuri, a senior AI concierge for a luxury resort. You help guests with questions and perform actions like checking availability and making bookings.

KNOWLEDGE BASE RULES:
- Answer ONLY based on the provided context if asked a factual question.
- Format responses professionally and warmly.

BOOKING & AGENT RULES:
- You have tools to check room availability, list services, and place bookings.
- ALWAYS check availability or the service list before confirming a booking to the guest.
- For every booking attempt, call `list_available_time_slots` for the selected item and date before placing the booking.
- Required booking fields:
  - guest_name (required)
  - item/room/service name (required)
  - date in YYYY-MM-DD (required)
  - time in HH:MM format (required)
- If a guest wants to book and any required field is missing, ask only for the missing field(s).
- If time is missing, ask for the preferred time and include a few available options from `list_available_time_slots`.
- Requested time is unavailable, recommend available times and ask the guest to choose one.
- As soon as all required fields are available and a valid time is selected, call `perform_booking` immediately.
- After a successful booking, provide the guest with their confirmation code and a summary of their stay/service.

CONTEXT FROM RESORT KNOWLEDGE BASE:
{context}

LANGUAGE RULES:
- Respond entirely and ONLY in {language}.
{language_instruction}
"""


def _get_language_instruction(language: str) -> str:
    lang_key = (language or "english").strip().lower()
    return f"- {LANGUAGE_INSTRUCTIONS[lang_key]}" if lang_key in LANGUAGE_INSTRUCTIONS else ""


def _build_contents(
    question: str,
    conversation_history: list[dict[str, str]] | None = None,
) -> list[genai.types.Content]:
    contents: list[genai.types.Content] = []
    trimmed_history = (conversation_history or [])[-CHAT_HISTORY_WINDOW:]
    for turn in trimmed_history:
        role = (turn.get("role") or "").strip().lower()
        text = (turn.get("text") or "").strip()
        if role not in {"user", "model"} or not text:
            continue
        contents.append(
            genai.types.Content(
                role=role,
                parts=[genai.types.Part.from_text(text=text)],
            )
        )
    contents.append(
        genai.types.Content(
            role="user",
            parts=[genai.types.Part.from_text(text=question)],
        )
    )
    return contents


def _looks_like_booking_request(question: str) -> bool:
    normalized = (question or "").strip().lower()
    if not normalized:
        return False

    booking_terms = (
        "book",
        "booking",
        "reserve",
        "reservation",
        "availability",
        "available",
        "vacancy",
        "time slot",
        "timeslot",
        "slot",
        "schedule",
        "check in",
        "check-in",
        "late checkout",
        "late check-out",
        "cancel",
    )
    return any(term in normalized for term in booking_terms)


def answer_question(
    question: str,
    hotel_id: str,
    language: str = "English",
    conversation_history: list[dict[str, str]] | None = None,
) -> dict:
    """
    Full Agentic RAG process: Retrieve chunks, provide tools, and handle function calling loop via Gemini.
    """
    # 1. Retrieve relevant chunks for context
    start_time = time.perf_counter()
    search_results = vector_query(question, hotel_id)
    chunks = search_results["documents"][0] if search_results["documents"] else []
    metadatas = search_results["metadatas"][0] if search_results["metadatas"] else []

    context_parts = []
    source_set = set()
    context_length = 0
    for doc, meta in zip(chunks, metadatas):
        filename = meta.get("filename", "Unknown")
        source_set.add(filename)
        snippet = str(doc or "").strip()
        if not snippet:
            continue
        remaining = RAG_MAX_CONTEXT_CHARS - context_length
        if remaining <= 0:
            break
        snippet = snippet[:remaining]
        context_parts.append(f"[Source: {filename}]\n{snippet}")
        context_length += len(snippet)
    context = "\n\n---\n\n".join(context_parts) if context_parts else "No specific context found."
    sources = list(source_set)

    # 2. Define local tools injected with current hotel_id
    def list_available_rooms() -> list:
        """Returns a list of available room types, prices, and counts for this resort."""
        return get_room_availability(hotel_id)

    def list_resort_services() -> list:
        """Returns a list of spa, dining, and activity services available at this resort."""
        return get_service_list(hotel_id)

    def list_available_time_slots(item_name: str, date: str) -> list:
        """Returns free HH:MM time slots for a room/service on a specific date."""
        return get_available_time_slots(hotel_id, item_name, date)

    def perform_booking(guest_name: str, item_name: str, date: str, time: str) -> dict:
        """
        Creates a formal booking in the system for a room or service.
        Requires guest_name, item_name, date, and time.
        """
        return book_item(hotel_id, guest_name, item_name, date, time)

    # 3. Generate response with Gemini (Automatic Function Calling enabled)
    client = _get_client()
    system_instruction = SYSTEM_PROMPT.format(
        context=context,
        language=language,
        language_instruction=_get_language_instruction(language)
    )
    should_enable_tools = _looks_like_booking_request(question)
    generate_config = genai.types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.15,
        max_output_tokens=768,
    )
    if should_enable_tools:
        generate_config.tools = [
            list_available_rooms,
            list_resort_services,
            list_available_time_slots,
            perform_booking,
        ]
        generate_config.automatic_function_calling = (
            genai.types.AutomaticFunctionCallingConfig(disable=False)
        )

    response = client.models.generate_content(
        model=GEMINI_CHAT_MODEL,
        contents=_build_contents(question, conversation_history),
        config=generate_config,
    )
    logger.info(
        "chat_rag_completed hotel_id=%s tools=%s sources=%s elapsed_ms=%s",
        hotel_id,
        should_enable_tools,
        len(sources),
        round((time.perf_counter() - start_time) * 1000),
    )

    return {
        "response": response.text,
        "sources": sources,
    }
