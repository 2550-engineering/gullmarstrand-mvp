import pytest
from fastapi.testclient import TestClient
from app.main import app
from sqlmodel import SQLModel
from app.database import engine

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    yield

def register_and_login(email, password, name="Test User"):
    client.post("/auth/register", json={"email": email, "password": password, "name": name})
    response = client.post("/auth/token", data={"username": email, "password": password})
    assert response.status_code == 200
    return response.json()["access_token"]

def test_user_crud():
    # Register admin (id=1)
    admin_token = register_and_login("admin@example.com", "potato")
    # Register another user
    user_token = register_and_login("user2@example.com", "user2pass", name="User 2")

    # List users (admin only)
    response = client.get("/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    users = response.json()
    assert len(users) == 2
    # List users as non-admin
    response = client.get("/users", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 403

    # Get user by id (self)
    response = client.get("/users/2", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "user2@example.com"
    # Get user by id (admin)
    response = client.get("/users/2", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    # Get user by id (other, forbidden)
    response = client.get("/users/1", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 403

    # Update user (self)
    response = client.put("/users/2", json={"name": "Updated User 2"}, headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 200
    assert response.json()["name"] == "Updated User 2"
    # Update user (other, forbidden)
    response = client.put("/users/1", json={"name": "Hacker"}, headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 403

    # Delete user (admin only)
    response = client.delete("/users/2", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 204
    # Delete user (non-admin forbidden)
    response = client.delete("/users/1", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 403
