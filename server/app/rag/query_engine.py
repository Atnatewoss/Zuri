from google import genai
from app.core.config import GEMINI_API_KEY, GEMINI_CHAT_MODEL
from app.rag.vector_store import query as vector_query
from app.rag.booking_tools import get_room_availability, get_service_list, book_item

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


SYSTEM_PROMPT = """You are Zuri, a senior AI concierge for a luxury resort. You help guests with questions and perform actions like checking availability and making bookings.

KNOWLEDGE BASE RULES:
- Answer ONLY based on the provided context if asked a factual question.
- Format responses professionally and warmly.

BOOKING & AGENT RULES:
- You have tools to check room availability, list services, and place bookings.
- ALWAYS check availability or the service list before confirming a booking to the guest.
- If a guest wants to book but hasn't provided their Full Name, the Date, or the Item/Room Type, politely ask for the missing information.
- Once all information is gathered, use the `book_item` tool.
- After a successful booking, provide the guest with their confirmation code and a summary of their stay/service.

CONTEXT FROM RESORT KNOWLEDGE BASE:
{context}

IMPORTANT: Respond entirely in {language}.
"""


def answer_question(question: str, hotel_id: str, language: str = "English") -> dict:
    """
    Full Agentic RAG process: Retrieve chunks, provide tools, and handle function calling loop via Gemini.
    """
    # 1. Retrieve relevant chunks for context
    search_results = vector_query(question, hotel_id)
    chunks = search_results["documents"][0] if search_results["documents"] else []
    metadatas = search_results["metadatas"][0] if search_results["metadatas"] else []

    context_parts = []
    source_set = set()
    for doc, meta in zip(chunks, metadatas):
        filename = meta.get("filename", "Unknown")
        source_set.add(filename)
        context_parts.append(f"[Source: {filename}]\n{doc}")
    context = "\n\n---\n\n".join(context_parts) if context_parts else "No specific context found."
    sources = list(source_set)

    # 2. Define local tools injected with current hotel_id
    def list_available_rooms() -> list:
        """Returns a list of available room types, prices, and counts for this resort."""
        return get_room_availability(hotel_id)

    def list_resort_services() -> list:
        """Returns a list of spa, dining, and activity services available at this resort."""
        return get_service_list(hotel_id)

    def perform_booking(guest_name: str, item_name: str, date: str, time: str = "TBD") -> dict:
        """
        Creates a formal booking in the system for a room or service.
        Requires guest_name, item_name, and date.
        """
        return book_item(hotel_id, guest_name, item_name, date, time)

    # 3. Generate response with Gemini (Automatic Function Calling enabled)
    client = _get_client()
    system_instruction = SYSTEM_PROMPT.format(context=context, language=language)

    response = client.models.generate_content(
        model=GEMINI_CHAT_MODEL,
        contents=question,
        config=genai.types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=[list_available_rooms, list_resort_services, perform_booking],
            automatic_function_calling=genai.types.AutomaticFunctionCallingConfig(disable=False),
            temperature=0.2,
            max_output_tokens=2048,
        ),
    )

    return {
        "response": response.text,
        "sources": sources,
    }

