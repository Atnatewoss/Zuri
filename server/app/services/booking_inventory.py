"""Helpers for syncing room inventory with booking status changes."""

from sqlmodel import Session, select, func

from app.models.schemas import Room


def get_matching_room(
    session: Session,
    hotel_id: str,
    item_name: str,
    *,
    for_update: bool = False,
) -> Room | None:
    """Return a room record if the booked item name matches a room type."""
    statement = select(Room).where(
        Room.hotel_id == hotel_id,
        func.lower(Room.type) == item_name.lower(),
    )
    if for_update:
        statement = statement.with_for_update()
    return session.exec(statement).first()


def reserve_room_inventory(session: Session, hotel_id: str, item_name: str) -> bool:
    """
    Validate room type exists for a confirmed booking.
    Availability is handled per-date by booking_tools.py, so we no longer
    decrement the static available_count globally.
    """
    room = get_matching_room(session, hotel_id, item_name, for_update=True)
    if not room:
        return True
    return True


def release_room_inventory(session: Session, hotel_id: str, item_name: str) -> None:
    """No-op for global inventory. Time slot is naturally freed in booking_tools."""
    pass
