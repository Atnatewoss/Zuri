"""Tools for Zuri Agent to handle bookings and availability."""
from typing import List, Dict, Any, Optional
from sqlmodel import Session, select
from app.models.schemas import Room, Service, Booking
from app.core.database import engine

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
    time: str = "TBD"
) -> Dict[str, Any]:
    """
    Creates a booking for a room or service. 
    Returns the confirmation details.
    
    Args:
        hotel_id: The unique ID of the resort.
        guest_name: Full name of the guest for the booking.
        item_name: The name of the room type or service being booked.
        date: The date of the booking (e.g., '2024-05-20').
        time: The specific time (optional for rooms, recommended for services).
    """
    # Simple validation: Check if room/service exists (omitted for brevity in this MVP tool)
    with Session(engine) as session:
        booking = Booking(
            hotel_id=hotel_id,
            guest_name=guest_name,
            service=item_name,
            date=date,
            time=time,
            status="Confirmed"
        )
        session.add(booking)
        session.commit()
        session.refresh(booking)
        
        return {
            "status": "success",
            "booking_id": booking.id,
            "confirmation_code": f"ZUR-{booking.id:04d}",
            "details": booking.model_dump()
        }
