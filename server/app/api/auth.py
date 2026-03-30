from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlmodel import Session, select
from app.core.auth import (
    verify_password,
    create_token_pair,
    verify_token,
    set_auth_cookies,
    clear_auth_cookies,
    REFRESH_COOKIE_NAME,
)
from app.core.database import get_session
from app.models.schemas import (
    ResortSettings,
    LoginRequest,
    ResortAuthResponse,
    TokenRefreshRequest,
    AuthRefreshResponse,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=ResortAuthResponse)
def login(
    request: LoginRequest,
    response: Response,
    session: Session = Depends(get_session),
):
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
    set_auth_cookies(response, access_token, refresh_token)
    return {
        "resort": resort,
        "is_onboarded": is_onboarded
    }

@router.post("/refresh", response_model=AuthRefreshResponse)
def refresh_token(
    response: Response,
    request: TokenRefreshRequest | None = None,
    refresh_cookie: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
):
    """Exchange a refresh token for a new access token."""
    refresh_token_value = ((request.refresh_token if request else None) or refresh_cookie or "").strip()
    if not refresh_token_value:
        raise HTTPException(status_code=401, detail="Refresh token required")

    payload = verify_token(refresh_token_value, expected_type="refresh")
    hotel_id = payload["hotel_id"]
    
    # Generate new pair (rotation)
    access_token, refresh_token = create_token_pair(hotel_id)
    set_auth_cookies(response, access_token, refresh_token)
    return {"ok": True}


@router.post("/logout")
def logout(response: Response):
    """Clear auth cookies."""
    clear_auth_cookies(response)
    return {"ok": True}
