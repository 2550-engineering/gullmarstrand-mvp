from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime
from backend.models import Listing, ListingImage
from backend.database import get_db
from backend.schemas import ListingCreate, ListingUpdate, ListingOut  # <-- import your schemas

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
    # Exclude images from the dict used to create the Listing
    db_listing = Listing(**listing.dict(exclude={"images"}))
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    # Save images if provided
    if listing.images:
        for img in listing.images:
            db_img = ListingImage(listing_id=db_listing.id, **img.dict())
            db.add(db_img)
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