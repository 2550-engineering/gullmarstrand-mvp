from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session, sessionmaker, joinedload
from sqlalchemy import create_engine
from pydantic import BaseModel, Field
from typing import List, Optional
from models import Base, Listing, ListingImage
from fastapi.middleware.cors import CORSMiddleware

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

# Pydantic schemas
class ListingImageOut(BaseModel):
    url_full: Optional[str]
    url_card: Optional[str]
    url_thumb: Optional[str]
    blurhash: Optional[str]

    class Config:
        orm_mode = True

class ListingBase(BaseModel):
    title: str = Field(..., max_length=120)
    description: str = Field(..., max_length=4000)
    price_sek: int
    condition: Optional[str]
    category_id: Optional[int]
    city: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    status: Optional[str]
    slug: Optional[str]
    canonical_url: Optional[str]

class ListingCreate(ListingBase):
    user_id: int

class ListingUpdate(ListingBase):
    pass

class ListingOut(ListingBase):
    id: int
    user_id: int
    images: List[ListingImageOut] = []

    class Config:
        orm_mode = True

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/listings/", response_model=List[ListingOut])
def read_listings(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    listings = db.query(Listing).options(joinedload(Listing.images)).offset(skip).limit(limit).all()
    return listings

@app.get("/listings/{listing_id}", response_model=ListingOut)
def read_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).options(joinedload(Listing.images)).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@app.post("/listings/", response_model=ListingOut, status_code=201)
def create_listing(listing: ListingCreate, db: Session = Depends(get_db)):
    db_listing = Listing(**listing.dict())
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing

@app.put("/listings/{listing_id}", response_model=ListingOut)
def update_listing(listing_id: int, listing: ListingUpdate, db: Session = Depends(get_db)):
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    for key, value in listing.dict(exclude_unset=True).items():
        setattr(db_listing, key, value)
    db.commit()
    db.refresh(db_listing)
    return db_listing

@app.delete("/listings/{listing_id}", status_code=204)
def delete_listing(listing_id: int, db: Session = Depends(get_db)):
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    db.delete(db_listing)
    db.commit()