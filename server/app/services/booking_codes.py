"""Confirmation code generation and lookup utilities."""

from __future__ import annotations

import secrets
import string
from sqlmodel import Session, select, func

from app.models.schemas import Booking

CODE_PREFIX = "ZUR-"
CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
CODE_LENGTH = 8


def _new_code() -> str:
    return CODE_PREFIX + "".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LENGTH))


def generate_unique_confirmation_code(session: Session) -> str:
    """Generate a unique confirmation code for bookings."""
    for _ in range(20):
        candidate = _new_code()
        exists = session.exec(
            select(Booking.id).where(Booking.confirmation_code == candidate)
        ).first()
        if not exists:
            return candidate
    # Extremely unlikely fallback, but deterministic uniqueness is required.
    return CODE_PREFIX + secrets.token_hex(6).upper()


def ensure_booking_confirmation_code(session: Session, booking: Booking) -> str:
    """Attach a confirmation code to a booking if missing and return it."""
    if booking.confirmation_code:
        return booking.confirmation_code

    booking.confirmation_code = generate_unique_confirmation_code(session)
    session.add(booking)
    return booking.confirmation_code


def _resolve_legacy_numeric_code(confirmation_code: str) -> int | None:
    value = (confirmation_code or "").strip().upper()
    if not value.startswith(CODE_PREFIX):
        return None
    suffix = value[len(CODE_PREFIX):]
    return int(suffix) if suffix.isdigit() else None


def find_booking_by_confirmation_code(
    session: Session,
    hotel_id: str,
    confirmation_code: str,
) -> Booking | None:
    """Find booking by persisted code, with fallback to legacy numeric style codes."""
    normalized = (confirmation_code or "").strip().upper()
    if not normalized:
        return None

    booking = session.exec(
        select(Booking).where(
            Booking.hotel_id == hotel_id,
            func.upper(Booking.confirmation_code) == normalized,
        )
    ).first()
    if booking:
        return booking

    legacy_id = _resolve_legacy_numeric_code(normalized)
    if legacy_id is None:
        return None
    return session.exec(
        select(Booking).where(Booking.hotel_id == hotel_id, Booking.id == legacy_id)
    ).first()

