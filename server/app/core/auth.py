import os
import base64
import hashlib
import hmac
import json
import time
import uuid
from typing import Dict, Tuple

from fastapi import Cookie, Header, HTTPException, Response
from app.core.config import APP_SECRET_KEY, ENV

# Token expiration times
ACCESS_TOKEN_EXPIRE_SECONDS = 3600  # 1 hour
REFRESH_TOKEN_EXPIRE_SECONDS = 86400 * 7  # 7 days

ACCESS_COOKIE_NAME = "zuri_access_token"
REFRESH_COOKIE_NAME = "zuri_refresh_token"

# Password hashing constants
SALT_SIZE = 16
ITERATIONS = 100000

def hash_password(password: str) -> str:
    """Hash a password using PBKDF2."""
    salt = os.urandom(SALT_SIZE)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, ITERATIONS)
    return f"{base64.b64encode(salt).decode('utf-8')}${base64.b64encode(key).decode('utf-8')}"

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        salt_b64, key_b64 = hashed_password.split('$')
        salt = base64.b64decode(salt_b64)
        key = base64.b64decode(key_b64)
        new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, ITERATIONS)
        return hmac.compare_digest(key, new_key)
    except Exception:
        return False

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

def _b64url_decode(data: str) -> bytes:
    padding = "=" * ((4 - len(data) % 4) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}")

def create_token_pair(hotel_id: str) -> Tuple[str, str]:
    """Create a pair of access and refresh tokens."""
    now = int(time.time())
    
    # Access Token
    access_payload = {
        "jti": str(uuid.uuid4()),
        "iss": "zuri-backend",
        "aud": "zuri-api",
        "hotel_id": hotel_id,
        "type": "access",
        "iat": now,
        "exp": now + ACCESS_TOKEN_EXPIRE_SECONDS,
    }
    access_token = _generate_signed_token(access_payload)
    
    # Refresh Token
    refresh_payload = {
        "jti": str(uuid.uuid4()),
        "iss": "zuri-backend",
        "aud": "zuri-api",
        "hotel_id": hotel_id,
        "type": "refresh",
        "iat": now,
        "exp": now + REFRESH_TOKEN_EXPIRE_SECONDS,
    }
    refresh_token = _generate_signed_token(refresh_payload)
    
    return access_token, refresh_token

def _generate_signed_token(payload: Dict) -> str:
    payload_raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    payload_b64 = _b64url_encode(payload_raw)
    sig = hmac.new(
        APP_SECRET_KEY.encode("utf-8"), 
        payload_b64.encode("utf-8"), 
        hashlib.sha256
    ).digest()
    return f"{payload_b64}.{_b64url_encode(sig)}"

def verify_token(token: str, expected_type: str = "access") -> dict:
    """Verify a token's signature, expiration, and type."""
    try:
        payload_b64, sig_b64 = token.split(".", 1)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token format")

    expected_sig = hmac.new(
        APP_SECRET_KEY.encode("utf-8"),
        payload_b64.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    provided_sig = _b64url_decode(sig_b64)

    if not hmac.compare_digest(expected_sig, provided_sig):
        raise HTTPException(status_code=401, detail="Invalid token signature")

    payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
    
    if int(payload.get("exp", 0)) < int(time.time()):
        raise HTTPException(status_code=440, detail=f"{expected_type.capitalize()} token expired")
    
    if payload.get("type") != expected_type:
        raise HTTPException(status_code=401, detail=f"Invalid token type: expected {expected_type}")
        
    if payload.get("iss") != "zuri-backend":
        raise HTTPException(status_code=401, detail="Invalid token issuer")
        
    if payload.get("aud") != "zuri-api":
        raise HTTPException(status_code=401, detail="Invalid token audience")
        
    if not payload.get("hotel_id"):
        raise HTTPException(status_code=401, detail="Invalid token payload")
        
    return payload

def get_authenticated_hotel_id(
    authorization: str | None = Header(default=None),
    access_cookie: str | None = Cookie(default=None, alias=ACCESS_COOKIE_NAME),
) -> str:
    token: str | None = None

    if authorization:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization scheme")
        token = authorization.split(" ", 1)[1].strip()
    elif access_cookie:
        token = access_cookie.strip()

    if not token:
        raise HTTPException(status_code=401, detail="Authorization required")

    payload = verify_token(token, expected_type="access")
    return str(payload["hotel_id"])


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    secure = ENV == "production"
    same_site = "none" if secure else "lax"

    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=secure,
        samesite=same_site,
        max_age=ACCESS_TOKEN_EXPIRE_SECONDS,
        path="/",
    )
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=secure,
        samesite=same_site,
        max_age=REFRESH_TOKEN_EXPIRE_SECONDS,
        path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    secure = ENV == "production"
    same_site = "none" if secure else "lax"
    response.delete_cookie(ACCESS_COOKIE_NAME, path="/", secure=secure, samesite=same_site)
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/", secure=secure, samesite=same_site)
