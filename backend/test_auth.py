import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app
from backend.models import Base, User
from backend.database import get_db
from passlib.context import CryptContext
import secrets

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency for testing
@pytest.fixture(scope="function")
def override_get_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(override_get_db):
    app.dependency_overrides[get_db] = lambda: override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides = {}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def test_register_user_success(client):
    response = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123", "name": "Test User", "city": "Test City"}
    )
    assert response.status_code == 200
    assert response.json()["msg"] == "User registered. Please verify your email."
    assert "verification_token" in response.json()

def test_register_user_email_exists(client):
    client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123", "name": "Test User", "city": "Test City"}
    )
    response = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123", "name": "Test User 2", "city": "Test City 2"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_user_success(client):
    # Register and verify user first
    register_response = client.post(
        "/auth/register",
        json={"email": "login@example.com", "password": "password123", "name": "Login User", "city": "Login City"}
    )
    token = register_response.json()["verification_token"]
    client.post(
        "/auth/verify-email",
        json={"email": "login@example.com", "token": token}
    )

    response = client.post(
        "/auth/login",
        json={"email": "login@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_user_invalid_credentials(client):
    response = client.post(
        "/auth/login",
        json={"email": "nonexistent@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

def test_login_user_email_not_verified(client):
    client.post(
        "/auth/register",
        json={"email": "unverified@example.com", "password": "password123", "name": "Unverified User", "city": "Unverified City"}
    )
    response = client.post(
        "/auth/login",
        json={"email": "unverified@example.com", "password": "password123"}
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Email not verified"

def test_verify_email_success(client):
    register_response = client.post(
        "/auth/register",
        json={"email": "verify@example.com", "password": "password123", "name": "Verify User", "city": "Verify City"}
    )
    token = register_response.json()["verification_token"]

    response = client.post(
        "/auth/verify-email",
        json={"email": "verify@example.com", "token": token}
    )
    assert response.status_code == 200
    assert response.json()["msg"] == "Email verified"

    # Verify user status in DB
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "verify@example.com").first()
    assert user.email_verified == True
    db.close()

def test_verify_email_invalid_token(client):
    client.post(
        "/auth/register",
        json={"email": "invalidtoken@example.com", "password": "password123", "name": "Invalid Token User", "city": "Invalid Token City"}
    )
    response = client.post(
        "/auth/verify-email",
        json={"email": "invalidtoken@example.com", "token": "wrongtoken"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid token"

def test_verify_email_user_not_found(client):
    response = client.post(
        "/auth/verify-email",
        json={"email": "nonexistent@example.com", "token": "anytoken"}
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"

def test_forgot_password_user_found(client):
    client.post(
        "/auth/register",
        json={"email": "forgot@example.com", "password": "password123", "name": "Forgot User", "city": "Forgot City"}
    )
    response = client.post(
        "/auth/forgot",
        json={"email": "forgot@example.com"}
    )
    assert response.status_code == 200
    assert response.json()["msg"] == "Password reset instructions sent (not implemented in MVP)"

def test_forgot_password_user_not_found(client):
    response = client.post(
        "/auth/forgot",
        json={"email": "nonexistent@example.com"}
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"
