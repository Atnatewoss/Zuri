"""Document ingestion — extract raw text from uploaded files."""

from pathlib import Path
from pypdf import PdfReader
from docx import Document as DocxDocument


def extract_text(file_path: Path) -> str:
    """Extract text content from PDF, DOCX, or TXT files."""
    suffix = file_path.suffix.lower()

    if suffix == ".pdf":
        return _extract_pdf(file_path)
    elif suffix == ".docx":
        return _extract_docx(file_path)
    elif suffix in (".txt", ".md", ".csv"):
        return file_path.read_text(encoding="utf-8", errors="ignore")
    else:
        raise ValueError(f"Unsupported file type: {suffix}")


def _extract_pdf(file_path: Path) -> str:
    reader = PdfReader(str(file_path))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n\n".join(pages)


def _extract_docx(file_path: Path) -> str:
    doc = DocxDocument(str(file_path))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)
