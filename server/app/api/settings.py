"""Resort Settings API — manage identity and AI persona."""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

from app.core.auth import get_authenticated_hotel_id
from app.core.database import get_session
from app.models.schemas import ResortSettings, SettingsUpdate

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("", response_model=ResortSettings)
def get_settings(
    hotel_id: str | None = None,
    auth_hotel_id: str = Depends(get_authenticated_hotel_id),
    session: Session = Depends(get_session),
):
    """
    Get resort settings. If none exist for this hotel_id,
    create default placeholder settings.
    """
    resolved_hotel_id = auth_hotel_id
    if hotel_id and hotel_id != auth_hotel_id:
        raise HTTPException(status_code=403, detail="Forbidden hotel_id access")

    settings = session.exec(
        select(ResortSettings).where(ResortSettings.hotel_id == resolved_hotel_id)
    ).first()

    if not settings:
        settings = ResortSettings(
            hotel_id=resolved_hotel_id,
            resort_name=f"Resort {resolved_hotel_id}",
            description="Welcome to our luxury resort.",
            location="Global",
            email=f"admin@{resolved_hotel_id}.com"
        )
        session.add(settings)
        session.commit()
        session.refresh(settings)

    return settings


@router.put("", response_model=ResortSettings)
def update_settings(
    update: SettingsUpdate,
    hotel_id: str | None = None,
    auth_hotel_id: str = Depends(get_authenticated_hotel_id),
    session: Session = Depends(get_session)
):
    """Update resort settings for a specific hotel."""
    resolved_hotel_id = auth_hotel_id
    if hotel_id and hotel_id != auth_hotel_id:
        raise HTTPException(status_code=403, detail="Forbidden hotel_id access")

    settings = session.exec(
        select(ResortSettings).where(ResortSettings.hotel_id == resolved_hotel_id)
    ).first()

    if not settings:
        logger.error(f"Failed to update settings: No settings found for hotel_id {resolved_hotel_id}")
        raise HTTPException(status_code=404, detail="Settings not found")

    update_data = update.model_dump(exclude_unset=True)
    logger.info(f"Updating settings for hotel_id '{resolved_hotel_id}' with data: {update_data}")
    for key, value in update_data.items():
        setattr(settings, key, value)

    session.add(settings)
    session.commit()
    session.refresh(settings)
    logger.info(f"Successfully updated settings for hotel_id '{resolved_hotel_id}'")
    return settings
