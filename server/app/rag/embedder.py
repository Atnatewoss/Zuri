"""Embedding generation using Google Gemini API."""

from google import genai
from app.core.config import GEMINI_API_KEY, GEMINI_EMBEDDING_MODEL

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for a list of text chunks using Gemini.
    Returns a list of embedding vectors.
    """
    client = _get_client()
    embeddings = []

    # Process in batches of 100 (Gemini batch limit)
    batch_size = 100
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        result = client.models.embed_content(
            model=GEMINI_EMBEDDING_MODEL,
            contents=batch,
        )
        for embedding in result.embeddings:
            embeddings.append(embedding.values)

    return embeddings


def generate_single_embedding(text: str) -> list[float]:
    """Generate a single embedding vector for a query."""
    client = _get_client()
    result = client.models.embed_content(
        model=GEMINI_EMBEDDING_MODEL,
        contents=text,
    )
    return result.embeddings[0].values
