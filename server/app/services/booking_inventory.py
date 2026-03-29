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
    Decrease room vacancy by 1 when a room booking is confirmed.
    Returns False if the room exists but is sold out.
    """
    room = get_matching_room(session, hotel_id, item_name, for_update=True)
    if not room:
        return True
    if room.available_count <= 0:
        return False
    room.available_count -= 1
    session.add(room)
    return True


def release_room_inventory(session: Session, hotel_id: str, item_name: str) -> None:
    """Increase room vacancy by 1 when a confirmed room booking is cancelled/unconfirmed."""
    room = get_matching_room(session, hotel_id, item_name, for_update=True)
    if not room:
        return
    room.available_count += 1
    session.add(room)
