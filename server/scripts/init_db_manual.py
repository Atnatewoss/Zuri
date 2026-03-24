import os
import sys
from pathlib import Path
from sqlmodel import SQLModel, create_engine

sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.core.config import DATABASE_URL
from app.models import schemas # Import models to register them with SQLModel metadata

engine = create_engine(DATABASE_URL)

def run_init():
    print(f"Initializing database at {DATABASE_URL.split('@')[-1]}...")
    SQLModel.metadata.create_all(engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    run_init()
