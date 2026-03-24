"""SQLModel database tables and Pydantic request/response schemas."""

from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from pydantic import BaseModel


# ─── Database Tables ───────────────────────────────────────────

class Document(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hotel_id: str = Field(index=True)
    filename: str
    file_size: str
    status: str = "Processing"  # Processing | Ready
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


class Service(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hotel_id: str = Field(index=True)
    name: str
    available: bool = True


class Room(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hotel_id: str = Field(index=True)
    type: str
    price: float
    available_count: int


class Booking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hotel_id: str = Field(index=True)
    guest_name: str
    service: str
    date: str
    time: str
    status: str = "Pending"  # Pending | Confirmed | Cancelled


class ResortSettings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hotel_id: str = Field(unique=True, index=True)
    resort_name: str = "Kuriftu Resort & Spa"
    description: str = "A luxury resort nestled in the Ethiopian highlands."
    location: str = "Addis Ababa, Ethiopia"
    email: str = "admin@kuriftu.com"


class ChatLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hotel_id: str = Field(index=True)
    user_message: str
    ai_response: str
    sources: str = ""  # JSON-encoded list of source filenames
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─── Request / Response Schemas ────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    hotel_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    sources: list[str] = []


class ServiceCreate(BaseModel):
    name: str
    available: bool = True
    hotel_id: str


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    available: Optional[bool] = None


class RoomCreate(BaseModel):
    type: str
    price: float
    available_count: int
    hotel_id: str


class RoomUpdate(BaseModel):
    type: Optional[str] = None
    price: Optional[float] = None
    available_count: Optional[int] = None


class BookingCreate(BaseModel):
    guest_name: str
    service: str
    date: str
    time: str
    status: str = "Pending"
    hotel_id: str


class BookingUpdate(BaseModel):
    status: Optional[str] = None


class SettingsUpdate(BaseModel):
    resort_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None


class ResortCreate(BaseModel):
    resort_name: str
    location: str
    email: str


class ResortSignupResponse(BaseModel):
    resort: ResortSettings
    session_token: str


class DashboardStats(BaseModel):
    total_requests: int
    resolved_requests: int
    staff_hours_reclaimed: str
    satisfaction_score: str
    total_documents: int
    documents_ready: int
