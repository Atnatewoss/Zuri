"""Knowledge base service — orchestrates the full document ingestion pipeline."""

from pathlib import Path
from sqlmodel import Session

from app.models.schemas import Document
from app.rag.ingest import extract_text
from app.rag.chunker import chunk_text
from app.rag.embedder import generate_embeddings
from app.rag.vector_store import add_document, delete_document as vector_delete


def process_document(doc_id: int, file_path: Path, filename: str, session: Session):
    """
    Ingestion pipeline: Extract text, chunk, embed, and store in ChromaDB.
    """
    try:
        # 1. Extract text
        text = extract_text(file_path)
        if not text:
            raise ValueError("No text extracted from document")

        # 2. Chunk text
        chunks = chunk_text(text)
        if not chunks:
            raise ValueError("No chunks generated from document")

        # 3. Generate embeddings
        embeddings = generate_embeddings(chunks)

        # 4. Get hotel_id from DB record
        doc = session.get(Document, doc_id)
        if not doc:
            raise ValueError("Document record not found")
        hotel_id = doc.hotel_id

        # 5. Store in vector store
        add_document(doc_id, hotel_id, chunks, embeddings, filename)

        # 6. Update status
        doc.status = "Ready"
        session.add(doc)
        session.commit()

    except Exception as e:
        print(f"Error processing document {doc_id}: {e}")
        doc = session.get(Document, doc_id)
        if doc:
            doc.status = "Error"
            session.add(doc)
            session.commit()
        raise e


def remove_document(document_id: int):
    """Remove a document's vectors from the vector store."""
    vector_delete(document_id)

def _update_status(session: Session, document_id: int, status: str):
    doc = session.get(Document, document_id)
    if doc:
        doc.status = status
        session.add(doc)
        session.commit()
