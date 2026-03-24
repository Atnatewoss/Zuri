"""Embeddable widget API — serve widget JS and install snippets."""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, JavaScriptResponse
from sqlmodel import Session, select

from app.core.auth import get_authenticated_hotel_id
from app.core.database import engine
from app.models.schemas import ResortSettings

router = APIRouter(prefix="/api/embed", tags=["Embed Widget"])

WIDGET_SOURCE_PATH = Path(__file__).resolve().parents[3] / "packages" / "widget" / "src" / "zuri-widget.js"


def _build_embed_snippet(base_url: str, hotel_id: str) -> str:
    script_url = f"{base_url}/api/embed/widget.js"
    return f"""<!-- Zuri AI Concierge Embed -->
<script 
    src="{script_url}" 
    data-hotel-id="{hotel_id}" 
    data-api-url="{base_url}"
    async
></script>"""


def _ensure_resort_exists(hotel_id: str) -> None:
    with Session(engine) as session:
        resort = session.exec(
            select(ResortSettings).where(ResortSettings.hotel_id == hotel_id)
        ).first()
        if not resort:
            raise HTTPException(status_code=404, detail="Resort not found")

@router.get("/script/{hotel_id}")
def get_embed_script(hotel_id: str, request: Request):
    """Returns the script tag that resorts can paste into their website."""
    base_url = str(request.base_url).rstrip("/")
    _ensure_resort_exists(hotel_id)
    tag = _build_embed_snippet(base_url, hotel_id)

    return HTMLResponse(content=f"<pre>{tag}</pre>")


@router.get("/snippet/{hotel_id}")
def get_embed_snippet(
    hotel_id: str,
    request: Request,
    auth_hotel_id: str = Depends(get_authenticated_hotel_id),
):
    """Returns structured embed snippet info for panel integrations."""
    if hotel_id != auth_hotel_id:
        raise HTTPException(status_code=403, detail="Forbidden hotel_id access")
    base_url = str(request.base_url).rstrip("/")
    _ensure_resort_exists(hotel_id)
    snippet = _build_embed_snippet(base_url, hotel_id)
    return {
        "hotel_id": hotel_id,
        "script_url": f"{base_url}/api/embed/widget.js",
        "api_url": base_url,
        "snippet": snippet,
    }


@router.get("/verify/{hotel_id}")
def verify_embed_install(
    hotel_id: str,
    request: Request,
    auth_hotel_id: str = Depends(get_authenticated_hotel_id),
):
    """Returns verification metadata to validate embed installation setup."""
    if hotel_id != auth_hotel_id:
        raise HTTPException(status_code=403, detail="Forbidden hotel_id access")
    base_url = str(request.base_url).rstrip("/")
    _ensure_resort_exists(hotel_id)
    script_url = f"{base_url}/api/embed/widget.js"
    mockup_url = f"{base_url}/api/embed/mockup/{hotel_id}"
    snippet = _build_embed_snippet(base_url, hotel_id)
    return {
        "ok": True,
        "hotel_id": hotel_id,
        "script_url": script_url,
        "mockup_url": mockup_url,
        "snippet": snippet,
    }


@router.get("/widget.js")
def serve_widget_js():
    """Serves the embeddable widget bundle directly from source."""
    if not WIDGET_SOURCE_PATH.exists():
        raise HTTPException(status_code=404, detail="Widget script not found")
    return JavaScriptResponse(content=WIDGET_SOURCE_PATH.read_text(encoding="utf-8"))

@router.get("/mockup/{hotel_id}")
def get_mockup_page(hotel_id: str, request: Request):
    """A mockup page to test the widget."""
    base_url = str(request.base_url).rstrip("/")
    _ensure_resort_exists(hotel_id)
    script_url = f"{base_url}/api/embed/widget.js"
    
    html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Resort Mockup - {hotel_id}</title>
    <style>
        body {{ font-family: sans-serif; background: #f4f4f9; padding: 50px; }}
        .content {{ max-width: 800px; margin: auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
        h1 {{ color: #1a1a1a; }}
    </style>
</head>
<body>
    <div class="content">
        <h1>Welcome to {hotel_id.capitalize()} Resort</h1>
        <p>This is a mockup of a resort website. The Zuri AI bubble should appear in the bottom right corner.</p>
        <p>Try asking about our rooms or spa services!</p>
    </div>

    <!-- Zuri AI Concierge Embed -->
    <script 
        src="{script_url}" 
        data-hotel-id="{hotel_id}" 
        data-api-url="{base_url}"
        async
    ></script>
</body>
</html>
"""
    return HTMLResponse(content=html)
