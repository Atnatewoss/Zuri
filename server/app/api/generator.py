"""API for dynamic resort data generation."""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.generator_service import generate_full_resort_data
from app.core.auth import get_authenticated_hotel_id

router = APIRouter(prefix="/api/generator", tags=["Data Generator"])

class GenerationRequest(BaseModel):
    hotel_id: str
    resort_name: str
    location: str

@router.post("/resort-data")
def generate_resort_data(
    request: GenerationRequest,
    hotel_id: str = Depends(get_authenticated_hotel_id)
):
    """
    Dynamically generates a full demo dataset for any resort.
    Useful for quick onboarding and high-fidelity demos.
    """
    try:
        request.hotel_id = hotel_id
        result = generate_full_resort_data(
            request.hotel_id, 
            request.resort_name, 
            request.location
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
