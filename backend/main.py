from fastapi import FastAPI
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from models import Base
from listings import router as listings_router
from auth import router as auth_router

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

# Include routers
app.include_router(listings_router)
app.include_router(auth_router)

@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <html>
        <head><title>Auth Test Page</title></head>
        <body>
            <h1>Welcome to the Auth API Test Page</h1>
            <p>Try the following endpoints with a tool like <a href='https://hoppscotch.io/'>Hoppscotch</a> or <a href='https://www.postman.com/'>Postman</a>:</p>
            <ul>
                <li>POST /auth/register</li>
                <li>POST /auth/login</li>
                <li>POST /auth/verify-email</li>
                <li>POST /auth/forgot</li>
            </ul>
            <p>Or use the <a href='/docs'>OpenAPI docs</a> for interactive testing.</p>
        </body>
    </html>
    """
