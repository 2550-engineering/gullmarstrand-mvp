from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from fastapi.responses import HTMLResponse
from backend.auth import router as auth_router
from backend.database import get_db, engine
from backend.models import Listing, Base

app = FastAPI()
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


class ListingImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    url_full: Optional[str] = None
    url_card: Optional[str] = None
    url_thumb: Optional[str] = None

class ListingCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: Optional[str] = None

class ListingUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: Optional[str] = None
    city: Optional[str] = None

class ListingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: str
    price_sek: int
    condition: Optional[str] = None
    city: Optional[str] = None
    status: Optional[str] = None
    published_at: Optional[datetime] = None
    user_id: Optional[int] = None
    category: Optional[ListingCategoryOut] = None
    user: Optional[ListingUserOut] = None
    images: List[ListingImageOut] = []

@app.get("/listings", response_model=List[ListingOut])
def list_listings(db: Session = Depends(get_db)):
    q = db.query(Listing).all()
    return q


@app.on_event("startup")
def ensure_tables():
    Base.metadata.create_all(bind=engine)
