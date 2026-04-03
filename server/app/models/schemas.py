"""SQLModel database tables and Pydantic request/response schemas."""

from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field
from pydantic import BaseModel, Field as PydanticField


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
    confirmation_code: Optional[str] = Field(default=None, index=True, unique=True)
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
    password_hash: str = ""
    allowed_domains: str = ""
    is_onboarded: bool = False


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
    language: str = "en-US"
    conversation_history: list[dict[str, str]] = PydanticField(default_factory=list)


class ChatResponse(BaseModel):
    response: str
    sources: list[str] = []


class SpeechTranscriptionResponse(BaseModel):
    text: str


class VoiceInteractionResponse(BaseModel):
    user_text: str
    ai_text: str
    audio_base64: str


class SpeechSynthesisRequest(BaseModel):
    text: str
    language: str = "English"


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


class PublicBookingCancelRequest(BaseModel):
    confirmation_code: str
    guest_name: str


class SettingsUpdate(BaseModel):
    resort_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    allowed_domains: Optional[str] = None
    is_onboarded: Optional[bool] = None


class ResortCreate(BaseModel):
    resort_name: str
    location: str
    email: str
    password: str


class ResortPublic(BaseModel):
    id: Optional[int]
    hotel_id: str
    resort_name: str
    description: str
    location: str
    email: str
    allowed_domains: str

class ResortAuthResponse(BaseModel):
    resort: ResortPublic
    is_onboarded: bool = False


class AuthRefreshResponse(BaseModel):
    ok: bool = True


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenRefreshRequest(BaseModel):
    refresh_token: Optional[str] = None


class RecentInteraction(BaseModel):
    id: int
    title: str
    description: str
    channel: str
    status: str
    created_at: datetime

class ChartDataPoint(BaseModel):
    name: str
    request: int

class DashboardStats(BaseModel):
    total_requests: int
    resolved_requests: int
    staff_hours_reclaimed: str
    satisfaction_score: str
    total_documents: int
    documents_ready: int
    # Property Info
    resort_name: str = ""
    admin_email: str = ""
    # Dynamic trends
    request_change_percent: float = 0.0
    automation_change_percent: float = 0.0
    reclaimed_change_percent: float = 0.0
    recent_interactions: List[RecentInteraction] = []
    chart_data: List[ChartDataPoint] = []
    is_onboarded: bool = False

class OnboardingRequest(BaseModel):
    resort_name: str
    location: str
    description: str
    currency: str = "USD"
