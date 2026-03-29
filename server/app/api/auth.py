from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from app.core.auth import verify_password, create_token_pair, verify_token
from app.core.database import get_session
from app.models.schemas import ResortSettings, LoginRequest, ResortAuthResponse, TokenRefreshRequest, Service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=ResortAuthResponse)
def login(request: LoginRequest, session: Session = Depends(get_session)):
    """Authenticate a resort user and return access/refresh tokens."""
    resort = session.exec(
        select(ResortSettings).where(ResortSettings.email == request.email)
    ).first()
    
    if not resort:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(request.password, resort.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    is_onboarded = resort.is_onboarded
    
    access_token, refresh_token = create_token_pair(resort.hotel_id)
    return {
        "resort": resort,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "is_onboarded": is_onboarded
    }

@router.post("/refresh")
def refresh_token(request: TokenRefreshRequest):
    """Exchange a refresh token for a new access token."""
    payload = verify_token(request.refresh_token, expected_type="refresh")
    hotel_id = payload["hotel_id"]
    
    # Generate new pair (rotation)
    access_token, refresh_token = create_token_pair(hotel_id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }
