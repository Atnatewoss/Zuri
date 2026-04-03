from fastapi.testclient import TestClient

from main import app


def test_root_and_health_endpoints_flow():
    client = TestClient(app)

    root = client.get("/")
    assert root.status_code == 200
    root_payload = root.json()
    assert root_payload["name"] == "Zuri AI Concierge"
    assert root_payload["status"] == "operational"
    assert root_payload["version"] == "1.0.0"

    health = client.get("/health")
    assert health.status_code == 200
    health_payload = health.json()
    assert health_payload["status"] == "healthy"
    assert health_payload["environment"] in {"development", "production", "staging"}
