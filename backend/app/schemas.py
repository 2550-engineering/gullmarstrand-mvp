from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    city: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    email_verified: bool
    created_at: datetime

    class Config:
        orm_mode = True

class CategoryBase(BaseModel):
    name: str
    slug: str
    parent_id: Optional[int]
    sort_order: Optional[int]
    icon: Optional[str]

class CategoryRead(CategoryBase):
    id: int
    class Config:
        orm_mode = True

class ListingBase(BaseModel):
    title: str
    description: str
    price_sek: int
    condition: str
    category_id: int
    city: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    status: str

class ListingCreate(ListingBase):
    pass

class ListingRead(ListingBase):
    id: int
    slug: Optional[str]
    canonical_url: Optional[str]
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    user_id: int
    class Config:
        orm_mode = True

class ListingImageRead(BaseModel):
    id: int
    url_full: Optional[str]
    url_card: Optional[str]
    url_thumb: Optional[str]
    blurhash: Optional[str]
    sort_order: Optional[int]
    class Config:
        orm_mode = True

class ListingReportCreate(BaseModel):
    reason_code: str
    note: Optional[str]

class ListingReportRead(ListingReportCreate):
    id: int
    reporter_id: Optional[int]
    created_at: datetime
    class Config:
        orm_mode = True

class OrderCreate(BaseModel):
    listing_id: int
    amount_sek: int
    delivery_type: str
    delivery_address_line1: Optional[str]
    delivery_address_postal: Optional[str]
    delivery_address_city: Optional[str]
    delivery_address_country: Optional[str]

class OrderRead(OrderCreate):
    id: int
    buyer_id: int
    seller_id: int
    status: str
    created_at: datetime
    class Config:
        orm_mode = True
