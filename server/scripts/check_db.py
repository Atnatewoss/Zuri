import os
import sys
from pathlib import Path
from sqlmodel import Session, create_engine, text

sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.core.config import DATABASE_URL

engine = create_engine(DATABASE_URL)

def check_tables():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        tables = [row[0] for row in result]
        print(f"Tables in public schema: {tables}")

if __name__ == "__main__":
    check_tables()
