"""Chat service — wraps RAG query engine and logs conversations."""

from sqlmodel import Session

from app.models.schemas import ChatLog
from app.rag.query_engine import answer_question


def chat(message: str, hotel_id: str, language: str, session: Session) -> dict:
    """Handle guest chat request for a tenant and persist chat logs."""
    rag_result = answer_question(message, hotel_id, language)

    chat_log = ChatLog(
        hotel_id=hotel_id,
        user_message=message,
        ai_response=rag_result["response"],
        sources=",".join(rag_result["sources"]),
    )
    session.add(chat_log)
    session.commit()

    return {
        "response": rag_result["response"],
        "sources": rag_result["sources"],
    }
