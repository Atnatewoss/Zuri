"""Bookings API — list, create, and update status."""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from app.core.database import get_session
from app.models.schemas import Booking, BookingCreate, BookingUpdate

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


@router.get("", response_model=List[Booking])
def list_bookings(hotel_id: str, session: Session = Depends(get_session)):
    """List all bookings for a specific hotel."""
    return session.exec(select(Booking).where(Booking.hotel_id == hotel_id)).all()


@router.post("", response_model=Booking)
def create_booking(booking: BookingCreate, session: Session = Depends(get_session)):
    """Create a new manual booking."""
    db_booking = Booking.model_validate(booking)
    session.add(db_booking)
    session.commit()
    session.refresh(db_booking)
    return db_booking


@router.put("/{booking_id}", response_model=Booking)
def update_booking_status(
    booking_id: int,
    hotel_id: str,
    update: BookingUpdate,
    session: Session = Depends(get_session)
):
    """Update booking status (Confirm/Cancel)."""
    db_booking = session.get(Booking, booking_id)
    if not db_booking or db_booking.hotel_id != hotel_id:
        raise HTTPException(status_code=404, detail="Booking not found")

    if update.status:
        db_booking.status = update.status

    session.add(db_booking)
    session.commit()
    session.refresh(db_booking)
    return db_booking
