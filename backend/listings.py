from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from backend.models import Listing, ListingImage
from backend.database import get_db

# Pydantic schemas (should ideally be in a separate schemas.py, but kept here for now)
class ListingImageOut(BaseModel):
    url_full: Optional[str]
    url_card: Optional[str]
    url_thumb: Optional[str]
    blurhash: Optional[str]

    class Config:
        from_attributes = True

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
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    images: List[ListingImageOut] = []

    class Config:
        from_attributes = True

router = APIRouter(prefix="/listings", tags=["listings"])

@router.get("/", response_model=List[ListingOut])
def read_listings(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    listings = db.query(Listing).options(joinedload(Listing.images)).offset(skip).limit(limit).all()
    return listings

@router.get("/{listing_id}", response_model=ListingOut)
def read_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).options(joinedload(Listing.images)).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.post("/", response_model=ListingOut, status_code=201)
def create_listing(listing: ListingCreate, db: Session = Depends(get_db)):
    db_listing = Listing(**listing.dict())
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing

@router.put("/{listing_id}", response_model=ListingOut)
def update_listing(listing_id: int, listing: ListingUpdate, db: Session = Depends(get_db)):
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    for key, value in listing.dict(exclude_unset=True).items():
        setattr(db_listing, key, value)
    db.commit()
    db.refresh(db_listing)
    return db_listing

@router.delete("/{listing_id}", status_code=204)
def delete_listing(listing_id: int, db: Session = Depends(get_db)):
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    db.delete(db_listing)
    db.commit()