"""Tools for Zuri Agent to handle bookings and availability."""
from datetime import datetime
from typing import List, Dict, Any
from sqlmodel import Session, select, func
from app.models.schemas import Room, Service, Booking
from app.core.database import engine
from app.services.booking_inventory import reserve_room_inventory
from app.services.booking_codes import ensure_booking_confirmation_code

DEFAULT_TIME_SLOTS = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
]


def _normalize_time(raw_time: str) -> str | None:
    value = (raw_time or "").strip()
    if not value:
        return None

    for fmt in ("%H:%M", "%I:%M %p", "%I %p"):
        try:
            return datetime.strptime(value, fmt).strftime("%H:%M")
        except ValueError:
            continue
    return None


def _resolve_room_capacity(session: Session, hotel_id: str, item_name: str) -> int:
    room = session.exec(
        select(Room).where(
            Room.hotel_id == hotel_id,
            func.lower(Room.type) == item_name.lower(),
        )
    ).first()
    if not room:
        return 1
    return max(int(room.available_count or 1), 1)


def get_available_time_slots(hotel_id: str, item_name: str, date: str) -> List[str]:
    """
    Returns available booking time slots for a specific room/service on a date.
    For rooms, capacity is based on available_count; for services, capacity is 1 per slot.
    """
    with Session(engine) as session:
        capacity = _resolve_room_capacity(session, hotel_id, item_name)
        bookings = session.exec(
            select(Booking.time)
            .where(Booking.hotel_id == hotel_id)
            .where(func.lower(Booking.service) == item_name.lower())
            .where(Booking.date == date)
            .where(Booking.status != "Cancelled")
        ).all()

        counts: dict[str, int] = {}
        for booking_time in bookings:
            normalized = _normalize_time(booking_time)
            if not normalized:
                continue
            counts[normalized] = counts.get(normalized, 0) + 1

        return [slot for slot in DEFAULT_TIME_SLOTS if counts.get(slot, 0) < capacity]


def get_room_availability(hotel_id: str) -> List[Dict[str, Any]]:
    """
    Returns a list of room types, their prices, and remaining availability for the specified resort.
    """
    with Session(engine) as session:
        statement = select(Room).where(Room.hotel_id == hotel_id)
        results = session.exec(statement).all()
        return [r.model_dump() for r in results]

def get_service_list(hotel_id: str) -> List[Dict[str, Any]]:
    """
    Returns a list of available services (e.g., Spa, Dining, Tours) for the specified resort.
    """
    with Session(engine) as session:
        statement = select(Service).where(Service.hotel_id == hotel_id, Service.available == True)
        results = session.exec(statement).all()
        return [s.model_dump() for s in results]

def book_item(
    hotel_id: str, 
    guest_name: str, 
    item_name: str, 
    date: str, 
    time: str
) -> Dict[str, Any]:
    """
    Creates a booking for a room or service. 
    Returns the confirmation details.
    
    Args:
        hotel_id: The unique ID of the resort.
        guest_name: Full name of the guest for the booking.
        item_name: The name of the room type or service being booked.
        date: The date of the booking (e.g., '2024-05-20').
        time: The booking time in HH:MM (required).
    """
    normalized_time = _normalize_time(time)
    if not normalized_time:
        available = get_available_time_slots(hotel_id, item_name, date)
        return {
            "status": "missing_time",
            "message": "A valid booking time is required (e.g., 14:00).",
            "available_times": available[:6],
        }

    available_times = get_available_time_slots(hotel_id, item_name, date)
    if normalized_time not in available_times:
        return {
            "status": "time_unavailable",
            "requested_time": normalized_time,
            "available_times": available_times[:6],
            "message": f"{item_name} is not available at {normalized_time} on {date}.",
        }

    with Session(engine) as session:
        reserved = reserve_room_inventory(session, hotel_id, item_name)
        if not reserved:
            return {
                "status": "no_vacancy",
                "message": f"No vacancy left for room type '{item_name}' on {date}.",
                "available_times": [],
            }

        booking = Booking(
            hotel_id=hotel_id,
            guest_name=guest_name,
            service=item_name,
            date=date,
            time=normalized_time,
            status="Confirmed"
        )
        code = ensure_booking_confirmation_code(session, booking)
        session.add(booking)
        session.commit()
        session.refresh(booking)
        
        return {
            "status": "success",
            "booking_id": booking.id,
            "confirmation_code": code,
            "details": booking.model_dump()
        }
