from sqlmodel import Session, select
from app import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str):
    return db.exec(select(models.User).where(models.User.email == email)).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        name=user.name,
        city=user.city,
        avatar_url=user.avatar_url
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    # Ensure all fields are loaded for Pydantic
    return db_user

def get_user(db: Session, user_id: int):
    return db.get(models.User, user_id)

def create_listing(db: Session, listing: schemas.ListingCreate, user_id: int):
    db_listing = models.Listing(**listing.dict(), user_id=user_id)
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing

def get_listing(db: Session, listing_id: int):
    return db.get(models.Listing, listing_id)


def get_listings(db: Session, skip: int = 0, limit: int = 20):
    return db.exec(select(models.Listing).offset(skip).limit(limit)).all()

def update_listing(db: Session, db_listing: models.Listing, listing: schemas.ListingCreate):
    for field, value in listing.dict().items():
        setattr(db_listing, field, value)
    db.commit()
    db.refresh(db_listing)
    return db_listing

def delete_listing(db: Session, db_listing: models.Listing):
    db.delete(db_listing)
    db.commit()
