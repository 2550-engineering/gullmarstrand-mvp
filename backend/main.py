from fastapi import FastAPI
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from listings import router as listings_router
from fastapi.middleware.cors import CORSMiddleware
from models import Base

DATABASE_URL = "sqlite:///marketplace.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include the listings router
app.include_router(listings_router)
