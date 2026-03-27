"""Resort management API — signup and ID generation."""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import re

from app.core.auth import create_token_pair, hash_password
from app.core.database import get_session
from app.models.schemas import ResortSettings, ResortCreate, ResortAuthResponse

router = APIRouter(prefix="/api/resorts", tags=["Resorts"])

def slugify(text: str) -> str:
    """Convert a name into a URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

@router.post("/signup", response_model=ResortAuthResponse)
def signup_resort(request: ResortCreate, session: Session = Depends(get_session)):
    """
    Sign up a new resort. 
    Automatically generates a unique 'hotel_id' from the resort name.
    """
    base_id = slugify(request.resort_name)
    hotel_id = base_id
    
    # Ensure uniqueness
    counter = 1
    while session.exec(select(ResortSettings).where(ResortSettings.hotel_id == hotel_id)).first():
        hotel_id = f"{base_id}-{counter}"
        counter += 1
    
    new_resort = ResortSettings(
        hotel_id=hotel_id,
        resort_name=request.resort_name,
        location=request.location,
        email=request.email,
        password_hash=hash_password(request.password),
        description=f"Welcome to {request.resort_name}."
    )
    
    session.add(new_resort)
    session.commit()
    session.refresh(new_resort)
    
    access_token, refresh_token = create_token_pair(new_resort.hotel_id)
    return {
        "resort": new_resort,
        "access_token": access_token,
        "refresh_token": refresh_token
    }


@router.get("/{hotel_id}", response_model=ResortSettings)
def get_resort(hotel_id: str, session: Session = Depends(get_session)):
    """Get a resort profile by its tenant hotel_id."""
    resort = session.exec(
        select(ResortSettings).where(ResortSettings.hotel_id == hotel_id)
    ).first()
    if not resort:
        raise HTTPException(status_code=404, detail="Resort not found")
    return resort
