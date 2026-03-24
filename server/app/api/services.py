from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from typing import List

from app.core.auth import get_authenticated_hotel_id
from app.core.database import get_session
from app.models.schemas import (
    Service, ServiceCreate, ServiceUpdate,
    Room, RoomCreate, RoomUpdate
)

router = APIRouter(tags=["Services & Rooms"])


# ─── Bulk Import Utilities ─────────────────────────────────────

@router.post("/api/services/bulk")
def bulk_create_services(
    hotel_id: str | None = None,
    data: str = Body(..., description="Multi-line string: Name, Available (true/false)"),
    auth_hotel_id: str = Depends(get_authenticated_hotel_id),
    session: Session = Depends(get_session)
):
    """Bulk create services from a multi-line string."""
    resolved_hotel_id = auth_hotel_id
    if hotel_id and hotel_id != auth_hotel_id:
        raise HTTPException(status_code=403, detail="Forbidden hotel_id access")

    created = []
    lines = data.strip().split("\n")
    for line in lines:
        if not line.strip(): continue
        parts = [p.strip() for p in line.split(",")]
        name = parts[0]
        available = parts[1].lower() == "true" if len(parts) > 1 else True
        
        db_service = Service(hotel_id=resolved_hotel_id, name=name, available=available)
        session.add(db_service)
        created.append(db_service)
    
    session.commit()
    return {"count": len(created), "services": created}


@router.post("/api/rooms/bulk")
def bulk_create_rooms(
    hotel_id: str | None = None,
    data: str = Body(..., description="Multi-line string: Type, Price, AvailableCount"),
    auth_hotel_id: str = Depends(get_authenticated_hotel_id),
    session: Session = Depends(get_session)
):
    """Bulk create rooms from a multi-line string."""
    resolved_hotel_id = auth_hotel_id
    if hotel_id and hotel_id != auth_hotel_id:
        raise HTTPException(status_code=403, detail="Forbidden hotel_id access")

    created = []
    lines = data.strip().split("\n")
    for line in lines:
        if not line.strip(): continue
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 3: continue
        
        room_type = parts[0]
        price = float(parts[1])
        count = int(parts[2])
        
        db_room = Room(hotel_id=resolved_hotel_id, type=room_type, price=price, available_count=count)
        session.add(db_room)
        created.append(db_room)
    
    session.commit()
    return {"count": len(created), "rooms": created}



# ─── Services ──────────────────────────────────────────────────

@router.get("/api/services", response_model=List[Service])
def list_services(
    hotel_id: str | None = None,
    auth_hotel_id: str = Depends(get_authenticated_hotel_id),
    session: Session = Depends(get_session),
):
    """List all services for a specific hotel."""
    resolved_hotel_id = auth_hotel_id
    if hotel_id and hotel_id != auth_hotel_id:
        raise HTTPException(status_code=403, detail="Forbidden hotel_id access")
    return session.exec(select(Service).where(Service.hotel_id == resolved_hotel_id)).all()


@router.post("/api/services", response_model=Service)
def create_service(service: ServiceCreate, session: Session = Depends(get_session)):
    """Create a new service for a hotel."""
    db_service = Service.model_validate(service)
    session.add(db_service)
    session.commit()
    session.refresh(db_service)
    return db_service


@router.put("/api/services/{service_id}", response_model=Service)
def update_service(service_id: int, hotel_id: str, service: ServiceUpdate, session: Session = Depends(get_session)):
    """Update an existing service."""
    db_service = session.get(Service, service_id)
    if not db_service or db_service.hotel_id != hotel_id:
        raise HTTPException(status_code=404, detail="Service not found")

    service_data = service.model_dump(exclude_unset=True)
    for key, value in service_data.items():
        setattr(db_service, key, value)

    session.add(db_service)
    session.commit()
    session.refresh(db_service)
    return db_service


@router.delete("/api/services/{service_id}")
def delete_service(service_id: int, hotel_id: str, session: Session = Depends(get_session)):
    """Remove a service."""
    db_service = session.get(Service, service_id)
    if not db_service or db_service.hotel_id != hotel_id:
        raise HTTPException(status_code=404, detail="Service not found")

    session.delete(db_service)
    session.commit()
    return {"ok": True}


# ─── Rooms ─────────────────────────────────────────────────────

@router.get("/api/rooms", response_model=List[Room])
def list_rooms(
    hotel_id: str | None = None,
    auth_hotel_id: str = Depends(get_authenticated_hotel_id),
    session: Session = Depends(get_session),
):
    """List all rooms for a specific hotel."""
    resolved_hotel_id = auth_hotel_id
    if hotel_id and hotel_id != auth_hotel_id:
        raise HTTPException(status_code=403, detail="Forbidden hotel_id access")
    return session.exec(select(Room).where(Room.hotel_id == resolved_hotel_id)).all()


@router.post("/api/rooms", response_model=Room)
def create_room(room: RoomCreate, session: Session = Depends(get_session)):
    """Create a new room type/instance."""
    db_room = Room.model_validate(room)
    session.add(db_room)
    session.commit()
    session.refresh(db_room)
    return db_room


@router.put("/api/rooms/{room_id}", response_model=Room)
def update_room(room_id: int, hotel_id: str, room: RoomUpdate, session: Session = Depends(get_session)):
    """Update room availability or price."""
    db_room = session.get(Room, room_id)
    if not db_room or db_room.hotel_id != hotel_id:
        raise HTTPException(status_code=404, detail="Room not found")

    room_data = room.model_dump(exclude_unset=True)
    for key, value in room_data.items():
        setattr(db_room, key, value)

    session.add(db_room)
    session.commit()
    session.refresh(db_room)
    return db_room


@router.delete("/api/rooms/{room_id}")
def delete_room(room_id: int, hotel_id: str, session: Session = Depends(get_session)):
    """Remove a room setup."""
    db_room = session.get(Room, room_id)
    if not db_room or db_room.hotel_id != hotel_id:
        raise HTTPException(status_code=404, detail="Room not found")

    session.delete(db_room)
    session.commit()
    return {"ok": True}
