from pydantic import BaseModel
from typing import List, Optional

# --- ListingImage schemas ---

class ListingImageCreate(BaseModel):
    url_full: Optional[str]
    url_card: Optional[str]
    url_thumb: Optional[str]
    blurhash: Optional[str] = ""

class ListingImageOut(ListingImageCreate):
    id: int

    class Config:
        from_attributes = True

# --- Listing schemas ---

class ListingBase(BaseModel):
    title: str
    description: str
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
    images: Optional[List[ListingImageCreate]] = []

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price_sek: Optional[int] = None
    condition: Optional[str] = None
    category_id: Optional[int] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None
    slug: Optional[str] = None
    canonical_url: Optional[str] = None
    images: Optional[List[ListingImageCreate]] = None

class ListingOut(ListingBase):
    id: int
    user_id: int
    images: List[ListingImageOut] = []

    class Config:
        from_attributes = True