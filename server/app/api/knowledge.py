"""Knowledge base API — upload, list, and delete documents."""

import shutil
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlmodel import Session, select

from app.core.auth import get_authenticated_hotel_id
from app.core.config import TEMP_UPLOAD_DIR
from app.core.database import get_session
from app.models.schemas import Document
from app.services.knowledge_service import process_document, remove_document

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge Base"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md", ".csv"}


@router.post("/upload")
async def upload_document(
    hotel_id: str | None = None,
    file: UploadFile = File(...),
    auth_hotel_id: str = Depends(get_authenticated_hotel_id),
    session: Session = Depends(get_session),
):
    """Upload a document and trigger the RAG ingestion pipeline for a specific hotel."""
    resolved_hotel_id = auth_hotel_id
    if hotel_id and hotel_id != auth_hotel_id:
        raise HTTPException(status_code=403, detail="Forbidden hotel_id access")

    # Validate file extension
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type: {suffix}. Allowed: {ALLOWED_EXTENSIONS}")

    # Save file temporarily for processing
    file_path = TEMP_UPLOAD_DIR / f"{resolved_hotel_id}_{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Get file size
    file_size = file_path.stat().st_size
    if file_size < 1024:
        size_str = f"{file_size} B"
    elif file_size < 1024 * 1024:
        size_str = f"{file_size / 1024:.1f} KB"
    else:
        size_str = f"{file_size / (1024 * 1024):.1f} MB"

    # Create DB record
    doc = Document(
        hotel_id=resolved_hotel_id,
        filename=file.filename,
        file_size=size_str,
        status="Processing",
        uploaded_at=datetime.utcnow(),
    )
    session.add(doc)
    session.commit()
    session.refresh(doc)

    # Run ingestion pipeline
    try:
        process_document(doc.id, file_path, file.filename, session)
    except Exception:
        pass  # Status is updated inside process_document
    finally:
        # Delete temp file — vectors are stored in ChromaDB Cloud
        if file_path.exists():
            file_path.unlink()

    session.refresh(doc)
    return doc


@router.get("/documents")
def list_documents(
    hotel_id: str | None = None,
    auth_hotel_id: str = Depends(get_authenticated_hotel_id),
    session: Session = Depends(get_session),
):
    """List all uploaded documents for a specific hotel."""
    resolved_hotel_id = auth_hotel_id
    if hotel_id and hotel_id != auth_hotel_id:
        raise HTTPException(status_code=403, detail="Forbidden hotel_id access")

    docs = session.exec(
        select(Document)
        .where(Document.hotel_id == resolved_hotel_id)
        .order_by(Document.uploaded_at.desc())
    ).all()
    return docs


@router.delete("/documents/{document_id}")
def delete_document(
    document_id: int,
    hotel_id: str | None = None,
    auth_hotel_id: str = Depends(get_authenticated_hotel_id),
    session: Session = Depends(get_session),
):
    """Delete a document and remove its vectors from the store."""
    resolved_hotel_id = auth_hotel_id
    if hotel_id and hotel_id != auth_hotel_id:
        raise HTTPException(status_code=403, detail="Forbidden hotel_id access")

    doc = session.get(Document, document_id)
    if not doc or doc.hotel_id != resolved_hotel_id:
        raise HTTPException(404, "Document not found")

    # Remove from ChromaDB Cloud
    try:
        remove_document(document_id)
    except Exception:
        pass  # Best effort

    # Remove from DB
    session.delete(doc)
    session.commit()

    return {"ok": True, "message": f"Document '{doc.filename}' deleted"}
