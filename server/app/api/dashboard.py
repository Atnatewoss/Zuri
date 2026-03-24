"""Dashboard API — aggregated hotel KPIs."""

from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func

from app.core.database import get_session
from app.models.schemas import ChatLog, Document, DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(hotel_id: str, session: Session = Depends(get_session)):
    """
    Calculate and return key performance indicators for the resort panel dashboard.
    """
    # 1. Total chats for this hotel
    total_requests = session.exec(
        select(func.count(ChatLog.id)).where(ChatLog.hotel_id == hotel_id)
    ).one()

    # 2. Mock some hospitality metrics (resolved is a proxy here)
    resolved_requests = int(total_requests * 0.85)

    # 3. Staff hours reclaimed (example formula: 10 mins per resolved request)
    minutes_saved = resolved_requests * 10
    hours_saved = round(minutes_saved / 60, 1)

    # 4. Satisfaction score (placeholder logic)
    satisfaction = "98.2%" if total_requests > 0 else "0%"

    # 5. Document counts for this hotel
    total_docs = session.exec(
        select(func.count(Document.id)).where(Document.hotel_id == hotel_id)
    ).one()
    ready_docs = session.exec(
        select(func.count(Document.id))
        .where(Document.hotel_id == hotel_id)
        .where(Document.status == "Ready")
    ).one()

    return DashboardStats(
        total_requests=total_requests,
        resolved_requests=resolved_requests,
        staff_hours_reclaimed=f"{hours_saved}h",
        satisfaction_score=satisfaction,
        total_documents=total_docs,
        documents_ready=ready_docs,
    )
