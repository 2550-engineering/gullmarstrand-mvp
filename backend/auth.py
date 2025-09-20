from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from backend.models import User, Base
from backend.database import get_db
from datetime import datetime, timedelta
import secrets

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory store for email verification tokens (replace with persistent store in production)
verification_tokens = {}

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    city: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = pwd_context.hash(data.password)
    user = User(email=data.email, password_hash=hashed_pw, name=data.name, city=data.city)
    db.add(user)
    db.commit()
    db.refresh(user)
    # Generate and store verification token
    token = secrets.token_urlsafe(32)
    verification_tokens[data.email] = token
    # In production, send email with token here
    return {"msg": "User registered. Please verify your email.", "verification_token": token}

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.email_verified:
        raise HTTPException(status_code=403, detail="Email not verified")
    # In production, generate JWT here
    token = secrets.token_urlsafe(32)
    return TokenResponse(access_token=token)

@router.post("/verify-email")
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if verification_tokens.get(data.email) != data.token:
        raise HTTPException(status_code=400, detail="Invalid token")
    user.email_verified = True
    db.commit()
    return {"msg": "Email verified"}

@router.post("/forgot")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # In production, send password reset email here
    return {"msg": "Password reset instructions sent (not implemented in MVP)"}
