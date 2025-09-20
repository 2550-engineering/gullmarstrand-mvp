from sqlalchemy import (
    Column, Integer, String, Boolean, Text, ForeignKey, DateTime, Float
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    email_verified = Column(Boolean, default=False)
    name = Column(String)
    city = Column(String)
    avatar_url = Column(String)
    token = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    listings = relationship('Listing', back_populates='user')
    reports = relationship('ListingReport', back_populates='reporter')
    orders_bought = relationship('Order', back_populates='buyer', foreign_keys='Order.buyer_id')
    orders_sold = relationship('Order', back_populates='seller', foreign_keys='Order.seller_id')

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True, autoincrement=True)
    parent_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    name = Column(String)
    slug = Column(String)
    sort_order = Column(Integer)
    icon = Column(String)
    
    parent = relationship('Category', remote_side=[id], backref='children')
    listings = relationship('Listing', back_populates='category')

class Listing(Base):
    __tablename__ = 'listings'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)
    price_sek = Column(Integer, nullable=False)
    condition = Column(String)
    category_id = Column(Integer, ForeignKey('categories.id'))
    city = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String)
    slug = Column(String)
    canonical_url = Column(String)
    published_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    user = relationship('User', back_populates='listings')
    category = relationship('Category', back_populates='listings')
    images = relationship('ListingImage', back_populates='listing')
    reports = relationship('ListingReport', back_populates='listing')
    orders = relationship('Order', back_populates='listing')

class ListingImage(Base):
    __tablename__ = 'listing_images'
    id = Column(Integer, primary_key=True, autoincrement=True)
    listing_id = Column(Integer, ForeignKey('listings.id'))
    url_full = Column(String)
    url_card = Column(String)
    url_thumb = Column(String)
    blurhash = Column(String)
    sort_order = Column(Integer)
    
    listing = relationship('Listing', back_populates='images')

class ListingReport(Base):
    __tablename__ = 'listing_reports'
    id = Column(Integer, primary_key=True, autoincrement=True)
    listing_id = Column(Integer, ForeignKey('listings.id'))
    reporter_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    reason_code = Column(String)
    note = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    
    listing = relationship('Listing', back_populates='reports')
    reporter = relationship('User', back_populates='reports')

class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True, autoincrement=True)
    buyer_id = Column(Integer, ForeignKey('users.id'))
    seller_id = Column(Integer, ForeignKey('users.id'))
    listing_id = Column(Integer, ForeignKey('listings.id'))
    amount_sek = Column(Integer)
    delivery_type = Column(String)
    delivery_address_line1 = Column(String)
    delivery_address_postal = Column(String)
    delivery_address_city = Column(String)
    delivery_address_country = Column(String)
    status = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    
    buyer = relationship('User', back_populates='orders_bought', foreign_keys=[buyer_id])
    seller = relationship('User', back_populates='orders_sold', foreign_keys=[seller_id])
    listing = relationship('Listing', back_populates='orders')
