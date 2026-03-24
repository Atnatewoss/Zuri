"""Service to generate resort data using Gemini."""

from google import genai
from app.core.config import GEMINI_API_KEY, GEMINI_CHAT_MODEL
import os
import json
from pathlib import Path

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client

def generate_full_resort_data(hotel_id: str, name: str, location: str):
    """
    Generate knowledge.txt, services.txt, and rooms.txt for a resort.
    Saves to data/<hotel_id>/ and returns the paths.
    """
    client = _get_client()
    
    # 1. Generate Knowledge Base
    kb_prompt = f"""
    Generate a highly detailed, professional knowledge base for a resort named '{name}' located in '{location}'.
    Include sections for:
    - Overview and Atmosphere
    - Room Categories (with estimated prices in USD and amenities)
    - Featured Services (Spa, Activities, Tours)
    - Dining Options (Restaurants and Bar names)
    - Practical Information (Check-in, Airport Shuttle, Wi-Fi)
    - Frequently Asked Questions for a chatbot.
    Format as clean, professional Markdown.
    """
    
    kb_response = client.models.generate_content(
        model=GEMINI_CHAT_MODEL,
        contents=kb_prompt
    )
    kb_text = kb_response.text

    # 2. Generate Structured Data (Services & Rooms)
    struct_prompt = f"""
    Based on the resort '{name}' in '{location}', generate two lists:
    1. Services: A multi-line string where each line is "Service Name, Available (true/false)".
    2. Rooms: A multi-line string where each line is "Room Type, Price (float), AvailableCount (int)".
    
    Return the response as a JSON object with keys "services" and "rooms".
    No talk, just the JSON.
    """
    
    struct_response = client.models.generate_content(
        model=GEMINI_CHAT_MODEL,
        contents=struct_prompt,
        config={'response_mime_type': 'application/json'}
    )
    struct_data = json.loads(struct_response.text)

    # 3. Save to data directory
    target_dir = Path("data") / hotel_id
    target_dir.mkdir(parents=True, exist_ok=True)
    
    (target_dir / "knowledge.txt").write_text(kb_text)
    (target_dir / "services.txt").write_text(struct_data["services"])
    (target_dir / "rooms.txt").write_text(struct_data["rooms"])
    
    return {
        "knowledge_path": str(target_dir / "knowledge.txt"),
        "services_path": str(target_dir / "services.txt"),
        "rooms_path": str(target_dir / "rooms.txt"),
        "data": {
            "knowledge": kb_text,
            "services": struct_data["services"],
            "rooms": struct_data["rooms"]
        }
    }
