"""
Orchestration script to onboard a resort with full data from the data/ directory.
Usage: uv run scripts/onboard_resort.py <hotel_id>
"""

import os
import sys
import requests
from pathlib import Path

BASE_URL = "http://localhost:8000"

def onboard(hotel_id: str):
    data_dir = Path("data") / hotel_id
    if not data_dir.exists():
        print(f"Error: Data directory for '{hotel_id}' not found at {data_dir}")
        return

    print(f"--- Onboarding Resort: {hotel_id.upper()} ---")

    # 1. Upload Knowledge Base
    kb_path = data_dir / "knowledge.txt"
    if kb_path.exists():
        print(f"Uploading Knowledge Base...")
        with open(kb_path, 'rb') as f:
            files = {'file': (kb_path.name, f, 'text/plain')}
            res = requests.post(f"{BASE_URL}/api/knowledge/upload", params={'hotel_id': hotel_id}, files=files)
            print(f"Status: {res.status_code}")
    else:
        print("Knowledge Base (knowledge.txt) missing, skipping.")

    # 2. Bulk Upload Services
    svc_path = data_dir / "services.txt"
    if svc_path.exists():
        print(f"Uploading Services...")
        data = svc_path.read_text()
        res = requests.post(f"{BASE_URL}/api/services/bulk", params={'hotel_id': hotel_id}, data=data)
        print(f"Status: {res.status_code}")
    else:
        print("Services list (services.txt) missing, skipping.")

    # 3. Bulk Upload Rooms
    room_path = data_dir / "rooms.txt"
    if room_path.exists():
        print(f"Uploading Rooms...")
        data = room_path.read_text()
        res = requests.post(f"{BASE_URL}/api/rooms/bulk", params={'hotel_id': hotel_id}, data=data)
        print(f"Status: {res.status_code}")
    else:
        print("Rooms list (rooms.txt) missing, skipping.")

    print(f"--- Onboarding Complete for {hotel_id} ---")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: uv run scripts/onboard_resort.py <hotel_id>")
        sys.exit(1)
    
    onboard(sys.argv[1])
