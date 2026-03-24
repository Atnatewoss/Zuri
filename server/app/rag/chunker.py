"""Text chunking with overlap for RAG embedding."""

from app.core.config import CHUNK_SIZE, CHUNK_OVERLAP


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """
    Split text into overlapping chunks by word count.
    Returns a list of text chunks.
    """
    words = text.split()
    if not words:
        return []

    chunks = []
    start = 0

    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)

        if end >= len(words):
            break
        start += chunk_size - overlap

    return chunks
