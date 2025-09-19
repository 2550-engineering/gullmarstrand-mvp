from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app import crud, schemas, deps
from app.models import User
from app.auth import verify_password, create_access_token
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

# --- USERS CRUD ---
@router.get("/users", response_model=List[schemas.UserRead])
def list_users(db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    # Only allow admin (id==1) for demo
    if current_user.id != 1:
        raise HTTPException(status_code=403, detail="Not authorized")
    users = db.exec(select(User)).all()
    return users

@router.get("/users/{user_id}", response_model=schemas.UserRead)
def get_user(user_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Only self or admin
    if user.id != current_user.id and current_user.id != 1:
        raise HTTPException(status_code=403, detail="Not authorized")
    return user

@router.put("/users/{user_id}", response_model=schemas.UserRead)
def update_user(user_id: int, user_update: schemas.UserBase, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Only admin can delete
    if current_user.id != 1:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(user)
    db.commit()
    return None


@router.post("/auth/register", response_model=schemas.UserRead)
def register(user: schemas.UserCreate, db: Session = Depends(deps.get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user)

@router.post("/auth/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(deps.get_db)):
    user = crud.get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=schemas.UserRead)
def read_users_me(current_user: User = Depends(deps.get_current_user)):
    return current_user

@router.post("/listings", response_model=schemas.ListingRead)
def create_listing(listing: schemas.ListingCreate, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    return crud.create_listing(db, listing, user_id=current_user.id)

@router.get("/listings", response_model=list[schemas.ListingRead])
def list_listings(skip: int = 0, limit: int = 20, db: Session = Depends(deps.get_db)):
    return crud.get_listings(db, skip=skip, limit=limit)


@router.get("/listings/{listing_id}", response_model=schemas.ListingRead)
def get_listing(listing_id: int, db: Session = Depends(deps.get_db)):
    listing = crud.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.put("/listings/{listing_id}", response_model=schemas.ListingRead)
def update_listing(listing_id: int, listing: schemas.ListingCreate, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    db_listing = crud.get_listing(db, listing_id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if db_listing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this listing")
    return crud.update_listing(db, db_listing, listing)

@router.delete("/listings/{listing_id}", status_code=204)
def delete_listing(listing_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    db_listing = crud.get_listing(db, listing_id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if db_listing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")
    crud.delete_listing(db, db_listing)
    return None
