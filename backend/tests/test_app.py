from fastapi.testclient import TestClient

import app.models
from app.database import Base, engine
from app.main import app


def test_healthcheck() -> None:
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_manual_item_and_comparison_flow() -> None:
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as client:
        first = client.post("/api/items/manual", json={"text": "MacBook Pro\nApple laptop for engineering work"})
        second = client.post("/api/items/manual", json={"text": "ThinkPad X1 Carbon\nLenovo laptop for business travel"})

        assert first.status_code == 201
        assert second.status_code == 201

        first_item = first.json()
        second_item = second.json()

        list_response = client.get("/api/items")
        assert list_response.status_code == 200
        assert len(list_response.json()) >= 2

        comparison_response = client.post(
            "/api/compare",
            json={"item_ids": [first_item["id"], second_item["id"]]},
        )

    assert comparison_response.status_code == 201

    comparison_payload = comparison_response.json()
    assert comparison_payload["item_ids"] == [first_item["id"], second_item["id"]]
    assert "Compared 2 items." in comparison_payload["report"]
    assert len(comparison_payload["table_data"]) == 2
