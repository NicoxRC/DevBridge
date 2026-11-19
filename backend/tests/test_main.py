from fastapi.testclient import TestClient

from app.auth import create_token
from app.main import app

client = TestClient(app)
ME = {"query": "{ me { email } }"}


class TestHealth:
    def test_reports_ok(self):
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    def test_unknown_routes_return_404(self):
        assert client.get("/nope").status_code == 404


class TestGraphQLAuthentication:
    def test_identifies_the_user_from_the_bearer_token(self, developer):
        response = client.post("/graphql", json=ME, headers={"Authorization": f"Bearer {create_token(developer.id, 'developer')}"})
        assert response.json()["data"]["me"] == {"email": "nico@demo.com"}

    def test_treats_an_invalid_token_as_a_visitor(self):
        response = client.post("/graphql", json=ME, headers={"Authorization": "Bearer invalid"})
        assert response.json()["data"]["me"] is None
