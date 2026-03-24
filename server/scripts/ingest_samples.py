"""Script to ingest sample resort documents into the RAG system."""

import os
import sys
import requests
from pathlib import Path

# Resort documents mapping
DOCS = {
    "kuriftu": "sample_docs/kuriftu_knowledge.txt",
    "haile": "sample_docs/haile_knowledge.txt",
    "sheraton": "sample_docs/sheraton_knowledge.txt"
}

BASE_URL = "http://localhost:8000"

def ingest_samples():
    print("Starting sample ingestion...")
    for hotel_id, file_path in DOCS.items():
        abs_path = Path(file_path).resolve()
        if not abs_path.exists():
            print(f"Skipping {hotel_id}: {file_path} not found")
            continue
            
        print(f"Uploading for {hotel_id}...")
        try:
            with open(abs_path, 'rb') as f:
                files = {'file': (abs_path.name, f, 'text/plain')}
                params = {'hotel_id': hotel_id}
                response = requests.post(f"{BASE_URL}/api/knowledge/upload", params=params, files=files)
                
            if response.status_code == 200:
                print(f"Successfully uploaded {hotel_id} doc. ID: {response.json().get('id')}")
            else:
                print(f"Failed {hotel_id}: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error for {hotel_id}: {e}")

if __name__ == "__main__":
    # Ensure server is running before this
    ingest_samples()
