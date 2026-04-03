from fastapi.testclient import TestClient

from main import app


def test_health_endpoint_reports_environment():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "healthy"
    assert payload["environment"] in {"development", "production", "staging"}
