"""RAG query engine — retrieval + Gemini generation."""

from google import genai
from app.core.config import GEMINI_API_KEY, GEMINI_CHAT_MODEL
from app.rag.vector_store import query as vector_query

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


SYSTEM_PROMPT = """You are Zuri, an AI concierge for a luxury resort. You help guests with their questions about the resort, its services, amenities, dining, activities, and policies.

RULES:
- Answer ONLY based on the provided context. If the context doesn't contain the answer, say so politely and suggest the guest contact the front desk.
- Be warm, professional, and concise — like a world-class concierge.
- When referencing information, mention which document it came from.
- Format your response in a clear, readable way.
- If the guest asks about something outside the resort scope, gently redirect them.

CONTEXT FROM RESORT KNOWLEDGE BASE:
{context}

IMPORTANT: Respond entirely in {language}.
"""


def answer_question(question: str, hotel_id: str, language: str = "English") -> dict:
    """
    Full RAG process: Retrieve chunks for hotel_id, format prompt, and generate answer via Gemini.
    """
    # 1. Retrieve relevant chunks
    # Assuming `vector_query` is now aliased as `query` or the function name changed in vector_store.py
    # and it now accepts hotel_id.
    search_results = vector_query(question, hotel_id)
    chunks = search_results["documents"][0] if search_results["documents"] else []
    metadatas = search_results["metadatas"][0] if search_results["metadatas"] else []

    # 2. Build context from retrieved chunks
    if not chunks:
        return {
            "response": "I'm sorry, I don't have enough information about our resort to answer that question accurately.",
            "sources": [],
        }
    else:
        context_parts = []
        source_set = set()
        for doc, meta in zip(chunks, metadatas): # Use 'chunks' here instead of 'documents'
            filename = meta.get("filename", "Unknown")
            source_set.add(filename)
            context_parts.append(f"[Source: {filename}]\n{doc}")
        context = "\n\n---\n\n".join(context_parts)
        sources = list(source_set)

    # 3. Generate response with Gemini
    client = _get_client()
    system_instruction = SYSTEM_PROMPT.format(context=context, language=language)

    response = client.models.generate_content(
        model=GEMINI_CHAT_MODEL,
        contents=question,
        config=genai.types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.3,
            max_output_tokens=4096,
        ),
    )

    return {
        "response": response.text,
        "sources": sources,
    }
