from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, nullable=False, unique=True)
    password_hash: str = Field(nullable=False)
    email_verified: bool = Field(default=False)
    name: Optional[str]
    city: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    listings: list["Listing"] = Relationship(back_populates="user")

class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    parent_id: Optional[int] = Field(default=None, foreign_key="category.id")
    name: str
    slug: str
    sort_order: Optional[int]
    icon: Optional[str]
    listings: list["Listing"] = Relationship(back_populates="category")

class Listing(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str = Field(nullable=False, max_length=120)
    description: str = Field(nullable=False, max_length=4000)
    price_sek: int = Field(nullable=False)
    condition: str
    category_id: int = Field(foreign_key="category.id")
    city: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    status: str
    slug: Optional[str]
    canonical_url: Optional[str]
    published_at: Optional[datetime]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user: Optional[User] = Relationship(back_populates="listings")
    category: Optional[Category] = Relationship(back_populates="listings")
    images: list["ListingImage"] = Relationship(back_populates="listing")
    reports: list["ListingReport"] = Relationship(back_populates="listing")

class ListingImage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    listing_id: int = Field(foreign_key="listing.id")
    url_full: Optional[str]
    url_card: Optional[str]
    url_thumb: Optional[str]
    blurhash: Optional[str]
    sort_order: Optional[int]
    listing: Optional[Listing] = Relationship(back_populates="images")

class ListingReport(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    listing_id: int = Field(foreign_key="listing.id")
    reporter_id: Optional[int] = Field(default=None, foreign_key="user.id")
    reason_code: str
    note: Optional[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    listing: Optional[Listing] = Relationship(back_populates="reports")

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    buyer_id: int = Field(foreign_key="user.id")
    seller_id: int = Field(foreign_key="user.id")
    listing_id: int = Field(foreign_key="listing.id")
    amount_sek: int
    delivery_type: str
    delivery_address_line1: Optional[str]
    delivery_address_postal: Optional[str]
    delivery_address_city: Optional[str]
    delivery_address_country: Optional[str]
    status: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
