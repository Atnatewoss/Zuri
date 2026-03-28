"""Dashboard API — aggregated hotel KPIs."""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func

from app.core.database import get_session
from app.core.auth import get_authenticated_hotel_id
from app.models.schemas import ChatLog, Document, DashboardStats, RecentInteraction, ResortSettings, ChartDataPoint, Service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    session: Session = Depends(get_session),
    hotel_id: str = Depends(get_authenticated_hotel_id)
):
    """
    Calculate and return key performance indicators for the resort panel dashboard.
    """
    # 0. Fetch Resort Info
    resort = session.exec(
        select(ResortSettings).where(ResortSettings.hotel_id == hotel_id)
    ).first()
    if not resort:
        raise HTTPException(status_code=404, detail="Resort settings not found")

    services_count = session.exec(
        select(func.count(Service.id)).where(Service.hotel_id == hotel_id)
    ).one()
    is_onboarded = services_count > 0

    # Date boundaries for percentage checks
    now = datetime.utcnow()
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_end = this_month_start - timedelta(seconds=1)
    last_month_start = last_month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # 1. Total chats for this hotel
    base_query = select(func.count(ChatLog.id)).where(ChatLog.hotel_id == hotel_id)
    total_requests = session.exec(base_query).one()

    this_month_reqs = session.exec(base_query.where(ChatLog.created_at >= this_month_start)).one()
    last_month_reqs = session.exec(base_query.where(ChatLog.created_at >= last_month_start).where(ChatLog.created_at < this_month_start)).one()

    # 2. Mock some hospitality metrics (resolved is a proxy here)
    resolved_requests = int(total_requests * 0.85)
    this_month_resolved = int(this_month_reqs * 0.85)
    last_month_resolved = int(last_month_reqs * 0.85)

    def calc_percent_change(current: int, previous: int) -> float:
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round(((current - previous) / previous) * 100, 1)

    # 3. Staff hours reclaimed (example formula: 10 mins per resolved request)
    minutes_saved = resolved_requests * 10
    hours_saved = round(minutes_saved / 60, 1)

    # 4. Satisfaction score (placeholder logic)
    satisfaction = "98.2%" if total_requests > 0 else "0.0%"

    # 5. Document counts for this hotel
    total_docs = session.exec(
        select(func.count(Document.id)).where(Document.hotel_id == hotel_id)
    ).one()
    ready_docs = session.exec(
        select(func.count(Document.id))
        .where(Document.hotel_id == hotel_id)
        .where(Document.status == "Ready")
    ).one()

    # 6. Fetch Recent Interactions
    recent_logs = session.exec(
        select(ChatLog)
        .where(ChatLog.hotel_id == hotel_id)
        .order_by(ChatLog.created_at.desc())
        .limit(5)
    ).all()

    recent_interactions = [
        RecentInteraction(
            id=log.id,
            title=log.user_message[:30] + "..." if len(log.user_message) > 30 else log.user_message,
            description=log.ai_response[:60] + "..." if len(log.ai_response) > 60 else log.ai_response,
            channel="Web Widget",
            status="Resolved",
            created_at=log.created_at
        )
        for log in recent_logs
    ]

    # 7. Calculate Chart Data (Last 7 Days)
    chart_data = []
    today = datetime.utcnow().date()
    start_time = datetime.utcnow() - timedelta(days=6)
    start_time = start_time.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Fetch timestamps in bulk to avoid N+1 query loops
    chart_logs = session.exec(
        select(ChatLog.created_at)
        .where(ChatLog.hotel_id == hotel_id)
        .where(ChatLog.created_at >= start_time)
    ).all()
    
    from collections import Counter
    counts_by_date = Counter([log_date.date().strftime("%d %b") for log_date in chart_logs])
    
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        date_str = target_date.strftime("%d %b")
        chart_data.append(ChartDataPoint(
            name=date_str,
            request=counts_by_date[date_str]
        ))

    return DashboardStats(
        total_requests=total_requests,
        resolved_requests=resolved_requests,
        staff_hours_reclaimed=f"{hours_saved}h" if hours_saved > 0 else "0h",
        satisfaction_score=satisfaction,
        total_documents=total_docs,
        documents_ready=ready_docs,
        resort_name=resort.resort_name,
        admin_email=resort.email,
        # Dynamic trends
        request_change_percent=calc_percent_change(this_month_reqs, last_month_reqs),
        automation_change_percent=calc_percent_change(this_month_resolved, last_month_resolved),
        reclaimed_change_percent=0.0,
        recent_interactions=recent_interactions,
        chart_data=chart_data,
        is_onboarded=is_onboarded
    )
