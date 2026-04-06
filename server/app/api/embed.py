"""Embeddable widget API — serve widget JS and install snippets."""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, Response
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
    return Response(content=WIDGET_SOURCE_PATH.read_text(encoding="utf-8"), media_type="application/javascript")

@router.get("/mockup/{hotel_id}")
def get_mockup_page(hotel_id: str, request: Request, theme: str = "dark"):
    """A premium mockup page to test the widget, designed for judges."""
    base_url = str(request.base_url).rstrip("/")
    _ensure_resort_exists(hotel_id)
    script_url = f"{base_url}/api/embed/widget.js"
    
    # Feature Flag: Audit Mode
    is_audit = request.query_params.get("audit") == "true"
    
    # Environment-aware Panel URL
    panel_url = "http://localhost:3000/dashboard"
    knowledge_url = "http://localhost:3000/dashboard/knowledge"
    if "localhost" not in base_url:
        panel_url = "https://zuriai.et/dashboard"
        knowledge_url = "https://zuriai.et/dashboard/knowledge"
        
    # Fetch Multi-Source Intelligence
    from app.models.schemas import Document, Service, Room
    with Session(engine) as session:
        docs = session.exec(select(Document).where(Document.hotel_id == hotel_id)).all()
        services = session.exec(select(Service).where(Service.hotel_id == hotel_id)).all()
        rooms = session.exec(select(Room).where(Room.hotel_id == hotel_id)).all()
        
    import json
    docs_json = json.dumps([{"id": d.id, "filename": d.filename, "size": d.file_size} for d in docs if d.status == "Ready"])
    services_json = json.dumps([{"name": s.name, "desc": "Premium resort service curated for guests.", "price": "Varies"} for s in services])
    rooms_json = json.dumps([{"name": r.type, "desc": f"Luxury accommodation. {r.available_count} units available.", "price": f"${r.price}/night"} for r in rooms])

    # Theme configuration
    is_light = theme == "light"
    if is_light:
        primary_bg, primary_text, secondary_text = "#FFFFFF", "#101827", "#64748b"
        border_color, toolbar_bg, toolbar_blur = "rgba(16, 24, 39, 0.1)", "rgba(255, 255, 255, 0.8)", "blur(12px)"
        brand_color, pill_bg, btn_bg, btn_text = "#101827", "#F1F5F9", "#101827", "#FFFFFF"
        sidebar_bg = "rgba(255, 255, 255, 1)"
    else:
        primary_bg, primary_text, secondary_text = "#0A0A0B", "#FFFFFF", "#a1a1aa"
        border_color, toolbar_bg, toolbar_blur = "#27272a", "rgba(10, 10, 11, 0.8)", "saturate(180%) blur(12px)"
        brand_color, pill_bg, btn_bg, btn_text = "#FFFFFF", "#27272a", "#FFFFFF", "#0A0A0B"
        sidebar_bg = "rgba(10, 10, 11, 1)"

    hero_bg = "radial-gradient(circle at 10% 20%, rgba(217, 119, 6, 0.05) 0%, transparent 40%)" if not is_light else "radial-gradient(circle at 10% 20%, rgba(217, 119, 6, 0.02) 0%, transparent 40%)"

    html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zuri | Sandbox - {hotel_id.capitalize()}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        :root {{
            --bg: {primary_bg}; --text: {primary_text}; --sec-text: {secondary_text};
            --amber: #D97706; --border: {border_color}; --toolbar: {toolbar_bg};
            --btn-bg: {btn_bg}; --btn-text: {btn_text}; --pill-bg: {pill_bg};
            --sidebar: {sidebar_bg};
        }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text);
            line-height: 1.5; -webkit-font-smoothing: antialiased; overflow: hidden;
            display: flex; height: 100vh;
        }}

        /* Professional Audit Sidebar */
        .knowledge-sidebar {{
            width: 320px; height: 100vh; background: var(--sidebar);
            border-right: 1px solid var(--border); display: {"flex" if is_audit else "none"};
            flex-direction: column; flex-shrink: 0; transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative; z-index: 2100; overflow: hidden;
            filter: none !important; backdrop-filter: none !important;
            box-shadow: {"20px 0 60px rgba(0,0,0,0.05)" if is_light else "20px 0 60px rgba(0,0,0,0.3)"};
        }}
        .knowledge-sidebar.collapsed {{ margin-left: -320px; }}

        .sidebar-header {{
            padding: 32px 24px; border-bottom: 1px solid var(--border);
            display: flex; justify-content: space-between; align-items: flex-start;
        }}
        .sidebar-header-text h2 {{ font-family: 'Playfair Display', serif; font-size: 20px; line-height: 1.2; }}
        .sidebar-header-text p {{ font-size: 10px; color: var(--sec-text); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }}
        
        .collapse-toggle {{
            width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
            display: flex; align-items: center; justify-content: center; cursor: pointer;
            color: var(--sec-text); transition: all 0.2s;
        }}
        .collapse-toggle:hover {{ background: var(--pill-bg); color: var(--amber); }}

        .sidebar-tabs {{ display: flex; padding: 20px 24px 0; gap: 16px; border-bottom: 1px solid var(--border); overflow-x: auto; }}
        .sidebar-tabs::-webkit-scrollbar {{ display: none; }}
        .tab-btn {{
            padding-bottom: 12px; font-size: 10px; font-weight: 700; color: var(--sec-text);
            cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s;
            letter-spacing: 0.05em; white-space: nowrap;
        }}
        .tab-btn:hover {{ color: var(--text); }}
        .tab-btn.active {{ color: var(--amber); border-color: var(--amber); }}

        .content-area {{ flex: 1; overflow-y: auto; padding: 20px; }}
        .intelligence-card {{
            padding: 16px; border-radius: 12px; background: var(--bg); border: 1px solid var(--border);
            margin-bottom: 12px; cursor: pointer; transition: all 0.2s;
        }}
        .intelligence-card:hover {{ border-color: var(--amber); transform: translateY(-2px); }}
        .card-header {{ display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }}
        .card-icon {{ color: var(--amber); opacity: 0.8; }}
        .card-title {{ font-size: 13px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }}
        .card-desc {{ font-size: 11px; color: var(--sec-text); line-height: 1.4; }}

        .sidebar-guidance {{ padding: 20px; border-top: 1px solid var(--border); background: var(--bg); }}
        .guidance-text {{ font-size: 10px; line-height: 1.5; color: var(--sec-text); font-style: italic; margin-bottom: 12px; }}

        /* Main Site Content */
        .site-viewport {{
            flex: 1; height: 100vh; position: relative; display: flex; flex-direction: column; overflow: hidden;
            background: var(--bg);
        }}

        .eval-toolbar {{
            height: 64px; background: var(--toolbar); backdrop-filter: {toolbar_blur};
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 40px; border-bottom: 1px solid var(--border); flex-shrink: 0;
        }}
        .brand-name {{
            font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500;
            letter-spacing: 0.15em; color: var(--text); display: flex; align-items: center; gap: 8px; opacity: 0.8;
        }}
        .header-actions {{ display: flex; align-items: center; gap: 24px; }}
        
        .status-indicator {{ display: flex; align-items: center; gap: 8px; padding: 6px 14px; background: var(--pill-bg); border-radius: 8px; }}
        .status-dot {{ width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; }}
        .status-text {{ font-size: 10px; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 1px; }}

        .cmd-btn {{
            background: var(--btn-bg); color: var(--btn-text); text-decoration: none;
            font-size: 10px; font-weight: 800; padding: 8px 16px; border-radius: 6px;
            letter-spacing: 0.1em; transition: all 0.2s;
        }}
        .cmd-btn:hover {{ transform: translateY(-1.5px); opacity: 0.9; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }}

        .hero-container {{ 
            flex: 1; background: {hero_bg}; padding: 0 10%; display: flex; flex-direction: column; justify-content: center;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }}
        .hero-container.blurred {{ filter: blur(12px) saturate(120%); opacity: 0.4; pointer-events: none; }}

        .hero-label {{ font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--amber); margin-bottom: 24px; opacity: 0.8; display: block; }}
        .hero-container h1 {{ font-family: 'Playfair Display', serif; font-size: clamp(2.5rem, 8vw, 5rem); line-height: 0.95; margin-bottom: 32px; }}
        .hero-container h1 i {{ font-style: italic; font-weight: 400; }}
        .hero-container p {{ font-size: 1.1rem; color: var(--sec-text); max-width: 500px; font-weight: 300; }}

        /* Re-open Toggle (When Sidebar Collapsed) */
        .audit-corner-toggle {{
            position: fixed; bottom: 32px; left: 24px; width: 44px; height: 44px;
            background: var(--btn-bg); color: var(--btn-text); border-radius: 50%;
            display: {"flex" if is_audit else "none"}; align-items: center; justify-content: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3); cursor: pointer; z-index: 2000;
            transition: all 0.3s; transform: scale(0); opacity: 0;
        }}
        .audit-corner-toggle.visible {{ transform: scale(1); opacity: 1; }}

        /* Focus Content Overlay */
        .widget-open-blur {{
            filter: blur(8px) grayscale(20%);
            opacity: 0.7;
            pointer-events: none;
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }}

        .focus-content {{
            position: fixed; top: 0; left: 320px; right: 0; bottom: 0;
            background: rgba(0,0,0,0.05); z-index: 2000000; display: none;
            backdrop-filter: blur(12px); align-items: center; justify-content: center; padding: 40px;
            transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }}
        .knowledge-sidebar.collapsed ~ .focus-content {{
            left: 0;
        }}
        .focus-content.active {{ display: flex; }}
        .focus-paper {{
            background: var(--sidebar); width: 100%; max-width: 800px; height: 85vh;
            border-radius: 24px; border: 1px solid var(--border); box-shadow: 0 50px 150px rgba(0,0,0,0.6);
            display: flex; flex-direction: column; overflow: hidden;
        }}
        .paper-header {{ padding: 24px 32px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }}
        .paper-body {{ flex: 1; overflow-y: auto; padding: 32px; font-size: 15px; line-height: 1.8; color: var(--text); }}
        .close-focus {{ cursor: pointer; color: var(--sec-text); transition: color 0.2s; }}
        .close-focus:hover {{ color: var(--amber); }}

        /* Premium Markdown Styles for Audit */
        .doc-markdown {{ 
            font-family: 'Inter', sans-serif; 
            font-size: 13px; 
            color: var(--sec-text); /* Lighter base color as requested */
            line-height: 1.6;
        }}
        .doc-markdown h1, .doc-markdown h2, .doc-markdown h3 {{ 
            font-family: 'Playfair Display', serif; 
            margin-top: 24px; 
            margin-bottom: 12px; 
            color: var(--text); /* Headers stay bright */
            font-weight: 700; 
            border-bottom: 1px solid var(--border); 
            padding-bottom: 6px;
        }}
        .doc-markdown h1 {{ font-size: 1.6em; }}
        .doc-markdown h2 {{ font-size: 1.4em; }}
        .doc-markdown h3 {{ font-size: 1.2em; }}
        
        .doc-markdown p {{ margin-bottom: 14px; color: var(--sec-text); opacity: 0.9; }}
        .doc-markdown ul, .doc-markdown ol {{ margin-bottom: 14px; padding-left: 20px; color: var(--sec-text); }}
        .doc-markdown li {{ margin-bottom: 6px; }}
        .doc-markdown code {{ 
            background: var(--pill-bg); padding: 2px 5px; border-radius: 4px; 
            font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--amber);
            font-weight: 500;
        }}
        .doc-markdown pre {{ 
            background: var(--pill-bg); padding: 16px; border-radius: 12px; 
            overflow-x: auto; margin-bottom: 16px; border: 1px solid var(--border);
        }}
        .doc-markdown table {{ 
            width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 20px; 
            font-size: 12px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border);
        }}
        .doc-markdown th, .doc-markdown td {{ 
            padding: 10px; text-align: left; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border);
        }}
        .doc-markdown th {{ background: var(--pill-bg); color: var(--text); font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }}
        .doc-markdown td {{ color: var(--sec-text); }}
        .doc-markdown tr:last-child td {{ border-bottom: none; }}
        .doc-markdown td:last-child, .doc-markdown th:last-child {{ border-right: none; }}
        .doc-markdown blockquote {{ 
            border-left: 4px solid var(--amber); padding-left: 16px; margin: 20px 0; 
            font-style: italic; color: var(--sec-text); font-size: 1em;
        }}
        .doc-markdown strong {{ color: var(--text); font-weight: 600; }}

        @media (max-width: 1000px) {{
            .knowledge-sidebar {{ display: none !important; }}
            .eval-toolbar {{ padding: 0 20px; }}
            .hero-container {{ padding: 0 24px; text-align: center; align-items: center; }}
        }}
    </style>
</head>
<body>
    <aside class="knowledge-sidebar" id="sidebar-v3">
        <div class="sidebar-header">
            <div class="sidebar-header-text">
                <h2>AI Training Data</h2>
                <p>Grounding Logic</p>
            </div>
            <div class="collapse-toggle" onclick="toggleAuditSidebar()">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
            </div>
        </div>

        <div class="sidebar-tabs">
            <div class="tab-btn active" id="tab-docs" onclick="switchAuditTab('docs')">DOCS</div>
            <div class="tab-btn" id="tab-services" onclick="switchAuditTab('services')">SERVICES</div>
            <div class="tab-btn" id="tab-rooms" onclick="switchAuditTab('rooms')">ROOMS</div>
        </div>
        
        <div class="content-area" id="audit-intelligence-list"></div>

        <div class="sidebar-guidance">
            <p class="guidance-text">Ground-truth data used by Zuri to resolve requests. Audit accurately below.</p>
            <a href="{knowledge_url}" style="color: var(--amber); font-size: 10px; font-weight: 800; text-decoration: none; letter-spacing: 0.1em;">SOURCE MANAGEMENT →</a>
        </div>
    </aside>

    <div class="audit-corner-toggle" id="open-audit-trigger" onclick="toggleAuditSidebar()">
        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
    </div>

    <main class="site-viewport">
        <header class="eval-toolbar">
            <div class="brand-name">ZURI / <span>SANDBOX</span></div>
            <div class="header-actions">
                <div class="status-indicator">
                    <div class="status-dot"></div>
                    <span class="status-text">Agent Active</span>
                </div>
                <a href="{panel_url}" class="cmd-btn">DASHBOARD</a>
            </div>
        </header>

        <section class="hero-container" id="mockup-hero">
            <span class="hero-label">// LIVE EVALUATION MODE</span>
            <h1>{hotel_id.capitalize()} <i>Resort</i></h1>
            <p>A new frontier in guest intelligence. Fully autonomous, data-driven, and session-aware.</p>
        </section>
    </main>

    <div class="focus-content" id="audit-focus-overlay">
        <div class="focus-paper">
            <div class="paper-header">
                <h2 id="audit-focus-title" style="font-family: 'Playfair Display', serif; font-size: 24px;"></h2>
                <div class="close-focus" onclick="closeAuditFocus()">
                    <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
            </div>
            <div class="paper-body" id="audit-focus-body"></div>
        </div>
    </div>

    <script>
        const auditData = {{
            docs: {docs_json},
            services: {services_json},
            rooms: {rooms_json}
        }};
        let currentAuditTab = 'docs';

        window.toggleAuditSidebar = function() {{
            const sidebar = document.getElementById('sidebar-v3');
            const openBtn = document.getElementById('open-audit-trigger');
            const isCollapsed = sidebar.classList.toggle('collapsed');
            
            if (isCollapsed) {{
                openBtn.classList.add('visible');
            }} else {{
                openBtn.classList.remove('visible');
            }}
        }};

        window.switchAuditTab = function(tabId) {{
            currentAuditTab = tabId;
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            const activeTab = document.getElementById(`tab-${{tabId}}`);
            if (activeTab) activeTab.classList.add('active');
            renderAuditIntelligence();
        }};

        function renderAuditIntelligence() {{
            const list = document.getElementById('audit-intelligence-list');
            const items = auditData[currentAuditTab];
            
            if (items.length === 0) {{
                list.innerHTML = `<div style="padding: 40px 20px; text-align: center; opacity: 0.5; font-size: 13px;">No data indexed for this category.</div>`;
                return;
            }}

            list.innerHTML = items.map((item, i) => `
                <div class="intelligence-card" onclick="inspectAuditItem('${{currentAuditTab}}', ${{i}})">
                    <div class="card-header">
                        <div class="card-icon">${{getAuditTabIcon(currentAuditTab)}}</div>
                        <span class="card-title">${{item.filename || item.name}}</span>
                    </div>
                    <p class="card-desc">${{currentAuditTab === 'docs' ? (item.size || 'Proprietary Knowledge') : (item.desc || 'Operational Metadata')}}</p>
                </div>
            `).join('');
        }}

        function getAuditTabIcon(tab) {{
            if (tab === 'docs') return '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>';
            if (tab === 'services') return '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path></svg>';
            return '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>';
        }}

        function parseAuditMarkdown(text) {{
            if (!text) return '';
            const nl = String.fromCharCode(10);
            let processed = text;
            // Split any "| ... |" sequences by inserting newlines between pipe-rows (for table detection)
            processed = processed.replace(/\\|\\s*\\|/g, '|' + nl + '|');
            // Ensure headings start on new lines
            processed = processed.replace(/([^\\n])(#{{1,6}} )/g, '$1' + nl + '$2');
            // Ensure list items start on new lines
            processed = processed.replace(/([^\\n])(\\s*-\\s)/g, '$1' + nl + '$2');

            if (window.marked && window.marked.parse) {{
                return '<div class="doc-markdown">' + window.marked.parse(processed) + '</div>';
            }}
            
            let html = processed
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^- (.*$)/gim, '<li>$1</li>');
            
            return '<div class="doc-markdown">' + html.split(nl).join('<br>') + '</div>';
        }}

        window.inspectAuditItem = async function(tab, index) {{
            const item = auditData[tab][index];
            const overlay = document.getElementById('audit-focus-overlay');
            const hero = document.getElementById('mockup-hero');
            const title = document.getElementById('audit-focus-title');
            const body = document.getElementById('audit-focus-body');

            title.innerText = item.filename || item.name;
            overlay.classList.add('active');
            hero.classList.add('blurred');

            if (tab === 'docs') {{
                body.innerHTML = '<div style="opacity: 0.5; padding: 20px;">Retrieving grounding sequence...</div>';
                try {{
                    const res = await fetch(`${{window.location.origin}}/api/knowledge/documents/${{item.id}}/content?hotel_id={hotel_id}`);
                    const json = await res.json();
                    body.innerHTML = parseAuditMarkdown(json.content);
                }} catch (e) {{ body.innerHTML = '<div style="color: #ef4444;">Failed to retrieve doc.</div>'; }}
            }} else {{
                body.innerHTML = `
                    <div style="margin-bottom: 24px;">
                        <h4 style="text-transform: uppercase; font-size: 11px; color: var(--amber); margin-bottom: 8px;">Description</h4>
                        <p style="font-size: 16px;">${{item.desc || 'No description available.'}}</p>
                    </div>
                    <div>
                        <h4 style="text-transform: uppercase; font-size: 11px; color: var(--amber); margin-bottom: 8px;">Pricing/Availability</h4>
                        <p style="font-size: 16px;">${{item.price || 'Direct resort info.'}}</p>
                    </div>
                `;
            }}
        }};

        window.closeAuditFocus = function() {{
            document.getElementById('audit-focus-overlay').classList.remove('active');
            document.getElementById('mockup-hero').classList.remove('blurred');
        }};

        // Audit Mode: blur observer + auto-open + greeting injection
        if ({str(is_audit).lower()}) {{

            // 1. Watch for widget open/close to toggle blur
            const blurObserver = new MutationObserver(function() {{
                const chatWin = document.getElementById('zuri-chat-window');
                const viewport = document.querySelector('.site-viewport');
                const toolbar = document.querySelector('.eval-toolbar');
                if (!chatWin || !viewport || !toolbar) return;
                if (chatWin.classList.contains('active')) {{
                    viewport.classList.add('widget-open-blur');
                    toolbar.classList.add('widget-open-blur');
                }} else {{
                    viewport.classList.remove('widget-open-blur');
                    toolbar.classList.remove('widget-open-blur');
                }}
            }});
            blurObserver.observe(document.body, {{ childList: true, subtree: true }});

            const AUDIT_GREETING = "Welcome to the <strong>{hotel_id.capitalize()}</strong> sandbox.<br><br>I'm Zuri, an autonomous agent tailored for East Africa. I'm not just a chatbot\u2014I take action by executing live bookings, curating recommendations, and supporting guests natively in English, Amharic, Oromifa, Tigrinya, Arabic, French and more.<br><br>Inspect my knowledge base in the <strong>left sidebar</strong>, then ask me for any guidance from recommendation to booking a room.";
            let greetingInjected = false;
            const greetObserver = new MutationObserver(function() {{
                if (greetingInjected) return;
                const msgBox = document.getElementById('zuri-messages');
                if (msgBox && msgBox.children.length > 0) {{
                    greetingInjected = true;
                    greetObserver.disconnect();
                    // Replace the default greeting with an audit-specific one
                    setTimeout(function() {{
                        const firstMsg = msgBox.querySelector('.zuri-msg.ai .zuri-msg-text');
                        if (firstMsg) {{
                            firstMsg.innerHTML = AUDIT_GREETING;
                        }}
                    }}, 100);
                }}
            }});
            greetObserver.observe(document.body, {{ childList: true, subtree: true }});

            // 3. Auto-open: try every 500ms once the widget script is loaded
            function tryOpenWidget() {{
                const bubble = document.getElementById('zuri-bubble');
                if (bubble) {{
                    bubble.click();
                    return true;
                }}
                return false;
            }}

            let openAttempts = 0;
            const openPoller = setInterval(function() {{
                const chatWin = document.getElementById('zuri-chat-window');
                if (chatWin && chatWin.classList.contains('active')) {{
                    clearInterval(openPoller);
                    return;
                }}
                if (tryOpenWidget()) {{
                    clearInterval(openPoller);
                    return;
                }}
                openAttempts++;
                if (openAttempts > 20) clearInterval(openPoller);
            }}, 500);
        }}

        // Initial trigger
        renderAuditIntelligence();
    </script>

    <!-- Zuri AI Concierge Embed -->
    <script src="{script_url}" data-hotel-id="{hotel_id}" data-api-url="{base_url}" async></script>
</body>
</html>
"""
    return HTMLResponse(content=html)
