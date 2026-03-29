"""Bookings API — list, create, and update status."""

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request
from sqlmodel import Session, select
from typing import List

from app.core.database import get_session
from app.core.auth import get_authenticated_hotel_id
from app.core.config import (
    BOOKING_CANCEL_RATE_LIMIT_WINDOW_SECONDS,
    BOOKING_CANCEL_RATE_LIMIT_MAX_REQUESTS,
    BOOKING_CANCEL_CODE_RATE_LIMIT_WINDOW_SECONDS,
    BOOKING_CANCEL_CODE_RATE_LIMIT_MAX_REQUESTS,
)
from app.core.origin import is_origin_allowed
from app.core.rate_limit import public_booking_cancel_limiter
from app.models.schemas import (
    Booking,
    BookingCreate,
    BookingUpdate,
    PublicBookingCancelRequest,
    ResortSettings,
)
from app.services.booking_inventory import reserve_room_inventory, release_room_inventory
from app.services.booking_codes import (
    ensure_booking_confirmation_code,
    find_booking_by_confirmation_code,
)

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

def _is_confirmed(status: str | None) -> bool:
    return (status or "").strip().lower() == "confirmed"


def _display_confirmation_code(booking: Booking) -> str:
    return booking.confirmation_code or f"ZUR-{(booking.id or 0):06d}"


@router.get("", response_model=List[Booking])
def list_bookings(
    session: Session = Depends(get_session),
    hotel_id: str = Depends(get_authenticated_hotel_id)
):
    """List all bookings for a specific hotel."""
    return session.exec(select(Booking).where(Booking.hotel_id == hotel_id)).all()


@router.post("", response_model=Booking)
def create_booking(
    booking: BookingCreate,
    session: Session = Depends(get_session),
    hotel_id: str = Depends(get_authenticated_hotel_id)
):
    """Create a new manual booking."""
    booking.hotel_id = hotel_id
    db_booking = Booking.model_validate(booking)

    if _is_confirmed(db_booking.status):
        reserved = reserve_room_inventory(session, hotel_id, db_booking.service)
        if not reserved:
            raise HTTPException(
                status_code=409,
                detail=f"No vacancy left for room type '{db_booking.service}'.",
            )

    ensure_booking_confirmation_code(session, db_booking)
    session.add(db_booking)
    session.commit()
    session.refresh(db_booking)
    return db_booking


@router.put("/{booking_id}", response_model=Booking)
def update_booking_status(
    booking_id: int,
    update: BookingUpdate,
    session: Session = Depends(get_session),
    hotel_id: str = Depends(get_authenticated_hotel_id)
):
    """Update booking status (Confirm/Cancel)."""
    db_booking = session.get(Booking, booking_id)
    if not db_booking or db_booking.hotel_id != hotel_id:
        raise HTTPException(status_code=404, detail="Booking not found")

    if update.status:
        was_confirmed = _is_confirmed(db_booking.status)
        will_be_confirmed = _is_confirmed(update.status)

        if not was_confirmed and will_be_confirmed:
            reserved = reserve_room_inventory(session, hotel_id, db_booking.service)
            if not reserved:
                raise HTTPException(
                    status_code=409,
                    detail=f"No vacancy left for room type '{db_booking.service}'.",
                )
        elif was_confirmed and not will_be_confirmed:
            release_room_inventory(session, hotel_id, db_booking.service)

        db_booking.status = update.status

    session.add(db_booking)
    session.commit()
    session.refresh(db_booking)
    return db_booking


@router.get("/public")
def list_public_bookings(
    request: Request,
    hotel_id: str | None = None,
    x_zuri_hotel_id: str | None = Header(default=None),
    limit: int = Query(default=10, ge=1, le=100),
    session: Session = Depends(get_session),
):
    """
    Public read-only feed for embedded resort websites.
    Access is restricted by resort allowed_domains.
    """
    resolved_hotel_id = hotel_id or x_zuri_hotel_id
    if not resolved_hotel_id:
        raise HTTPException(status_code=400, detail="hotel_id is required")

    resort = _resolve_resort(session, resolved_hotel_id)
    if not resort:
        raise HTTPException(status_code=404, detail="Resort not found")

    _enforce_allowed_origin(request, resort)

    bookings = session.exec(
        select(Booking)
        .where(Booking.hotel_id == resolved_hotel_id)
        .order_by(Booking.id.desc())
        .limit(limit)
    ).all()

    return [
        {
            "id": b.id,
            "confirmation_code": _display_confirmation_code(b),
            "guest_name": b.guest_name,
            "service": b.service,
            "date": b.date,
            "time": b.time,
            "status": b.status,
        }
        for b in bookings
    ]


@router.post("/public/cancel")
def cancel_public_booking(
    payload: PublicBookingCancelRequest,
    request: Request,
    hotel_id: str | None = None,
    x_zuri_hotel_id: str | None = Header(default=None),
    session: Session = Depends(get_session),
):
    """
    Public cancellation endpoint for embedded resort websites.
    Requires confirmation code and guest full name.
    """
    resolved_hotel_id = hotel_id or x_zuri_hotel_id
    if not resolved_hotel_id:
        raise HTTPException(status_code=400, detail="hotel_id is required")

    resort = _resolve_resort(session, resolved_hotel_id)
    if not resort:
        raise HTTPException(status_code=404, detail="Resort not found")

    _enforce_allowed_origin(request, resort)

    client_ip = (request.client.host if request.client else "unknown").strip()
    ip_key = f"cancel:{resolved_hotel_id}:{client_ip}"
    allowed_ip = public_booking_cancel_limiter.allow(
        key=ip_key,
        max_requests=BOOKING_CANCEL_RATE_LIMIT_MAX_REQUESTS,
        window_seconds=BOOKING_CANCEL_RATE_LIMIT_WINDOW_SECONDS,
    )
    if not allowed_ip:
        raise HTTPException(status_code=429, detail="Too many cancellation attempts. Please try again later.")

    normalized_code = payload.confirmation_code.strip().upper()
    code_key = f"cancel-code:{resolved_hotel_id}:{normalized_code}:{client_ip}"
    allowed_code = public_booking_cancel_limiter.allow(
        key=code_key,
        max_requests=BOOKING_CANCEL_CODE_RATE_LIMIT_MAX_REQUESTS,
        window_seconds=BOOKING_CANCEL_CODE_RATE_LIMIT_WINDOW_SECONDS,
    )
    if not allowed_code:
        raise HTTPException(status_code=429, detail="Too many attempts for this booking code. Please try again later.")

    booking = find_booking_by_confirmation_code(
        session=session,
        hotel_id=resolved_hotel_id,
        confirmation_code=normalized_code,
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found for that confirmation code.")

    if booking.guest_name.strip().lower() != payload.guest_name.strip().lower():
        raise HTTPException(status_code=403, detail="Guest name does not match this booking.")

    if _is_confirmed(booking.status):
        release_room_inventory(session, resolved_hotel_id, booking.service)

    booking.status = "Cancelled"
    session.add(booking)
    session.commit()
    session.refresh(booking)

    return {
        "ok": True,
        "message": "Your booking has been cancelled.",
        "confirmation_code": _display_confirmation_code(booking),
        "status": booking.status,
    }


def _resolve_resort(session: Session, hotel_id: str) -> ResortSettings | None:
    return session.exec(
        select(ResortSettings).where(ResortSettings.hotel_id == hotel_id)
    ).first()


def _enforce_allowed_origin(request: Request, resort: ResortSettings) -> None:
    if resort.allowed_domains and not is_origin_allowed(
        resort.allowed_domains,
        request.headers.get("origin"),
    ):
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Origin not allowed for this resort.",
        )
