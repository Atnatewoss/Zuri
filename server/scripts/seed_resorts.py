"""Seed script to populate the database with sample resort data (Clean & Seed)."""

import os
import sys
from pathlib import Path

# Add the server directory to sys.path for absolute imports
sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlmodel import Session, create_engine, select, delete
from app.core.config import DATABASE_URL
from app.models.schemas import ResortSettings, Service, Room

engine = create_engine(DATABASE_URL)

def seed_resorts():
    with Session(engine) as session:
        # Define sample data
        resorts = [
            {
                "id": "kuriftu",
                "name": "Kuriftu Resort & Spa Bishoftu",
                "desc": "A luxury resort featuring an overwater spa and a famous water park on the shores of Lake Bishoftu.",
                "loc": "Bishoftu, Ethiopia",
                "email": "bishoftu@kuriftu.com",
                "services": ["Water Park Access", "Swedish Massage (60 min)", "Lakeside Dinner"],
                "rooms": [("Standard Room", 97.0, 10), ("Deluxe Room", 116.0, 5), ("Presidential Suite", 250.0, 1)]
            },
            {
                "id": "haile",
                "name": "Haile Resort Hawassa",
                "desc": "Owned by the legendary Haile Gebrselassie, this resort offers premium lakeside luxury.",
                "loc": "Hawassa, Ethiopia",
                "email": "info@haileresorts.com",
                "services": ["Mini-golf Session", "Horseback Riding", "Eden Spa Aromatherapy"],
                "rooms": [("Classic Queen", 114.0, 15), ("Double Lake View", 133.0, 8), ("Family Apartment", 210.0, 3)]
            },
            {
                "id": "sheraton",
                "name": "Sheraton Addis Luxury Collection",
                "desc": "The most iconic luxury hotel in Ethiopia, known for its refined service and 11 restaurants.",
                "loc": "Addis Ababa, Ethiopia",
                "email": "reservations@sheratonaddis.com",
                "services": ["Fine Dining at Stagioni", "Health Club Day Pass", "Gaslight Club Access"],
                "rooms": [("Classic King", 440.0, 50), ("Executive Junior Suite", 650.0, 10), ("Royal Villa", 2500.0, 1)]
            }
        ]

        for r in resorts:
            print(f"Processing {r['id']}...")
            
            # 1. Clean existing data for this hotel_id (to avoid integrity errors)
            session.exec(delete(Service).where(Service.hotel_id == r["id"]))
            session.exec(delete(Room).where(Room.hotel_id == r["id"]))
            session.exec(delete(ResortSettings).where(ResortSettings.hotel_id == r["id"]))
            session.commit() # Commit deletion first

            # 2. Insert new data
            session.add(ResortSettings(
                hotel_id=r["id"],
                resort_name=r["name"],
                description=r["desc"],
                location=r["loc"],
                email=r["email"]
            ))
            
            for s_name in r["services"]:
                session.add(Service(hotel_id=r["id"], name=s_name, available=True))
            
            for rt, price, count in r["rooms"]:
                session.add(Room(hotel_id=r["id"], type=rt, price=price, available_count=count))

            session.commit()
            print(f"Successfully seeded {r['id']}")

    print("All seeding complete!")

if __name__ == "__main__":
    seed_resorts()
