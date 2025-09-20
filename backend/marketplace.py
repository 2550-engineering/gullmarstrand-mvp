from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid
from datetime import datetime, timezone
from typing import Optional

from backend.models import User, Category, Listing, ListingImage, ListingReport, Order
from backend.database import get_db

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

# Pydantic models for request and response
class CheckoutRequest(BaseModel):
    buyer_id: int
    listing_id: int
    delivery_type: str # "pickup" or "flat"
    delivery_address_line1: Optional[str] = None
    delivery_address_postal: Optional[str] = None
    delivery_address_city: Optional[str] = None
    delivery_address_country: Optional[str] = None

class CheckoutResponse(BaseModel):
    payment_intent_secret: str
    order_id: int

class PaymentWebhookRequest(BaseModel):
    order_id: int
    payment_status: str # "succeeded" or "failed"

class OrderResponse(BaseModel):
    id: int
    buyer_id: int
    seller_id: int
    listing_id: int
    amount_sek: float
    delivery_type: str
    delivery_address_line1: Optional[str] = None
    delivery_address_postal: Optional[str] = None
    delivery_address_city: Optional[str] = None
    delivery_address_country: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

AUTO_FLIP_LISTING_TO_SOLD = True # Define the configuration variable

@router.post("/checkout", response_model=CheckoutResponse, status_code=status.HTTP_201_CREATED)
def checkout(request_data: CheckoutRequest, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == request_data.listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    if listing.user_id == request_data.buyer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot buy your own listing")
    
    if listing.status != 'published':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Listing is not available for purchase")

    new_order = Order(
        buyer_id=request_data.buyer_id,
        seller_id=listing.user_id,
        listing_id=request_data.listing_id,
        amount_sek=listing.price_sek,
        delivery_type=request_data.delivery_type,
        delivery_address_line1=request_data.delivery_address_line1,
        delivery_address_postal=request_data.delivery_address_postal,
        delivery_address_city=request_data.delivery_address_city,
        delivery_address_country=request_data.delivery_address_country,
        status='created',
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    payment_intent_secret = str(uuid.uuid4())

    return CheckoutResponse(payment_intent_secret=payment_intent_secret, order_id=new_order.id)

@router.post("/payments/webhook", status_code=status.HTTP_200_OK)
def payments_webhook(request_data: PaymentWebhookRequest, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == request_data.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if request_data.payment_status == 'succeeded':
        order.status = 'paid'
        if AUTO_FLIP_LISTING_TO_SOLD:
            listing = db.query(Listing).filter(Listing.id == order.listing_id).first()
            if listing:
                listing.status = 'sold'
        print(f"Simulating receipt email for order {order.id} to buyer {order.buyer_id}")
    elif request_data.payment_status == 'failed':
        order.status = 'canceled'
    
    db.commit()
    db.refresh(order)

    return {"message": f"Order {order.id} status updated to {order.status}"}

@router.get("/orders", response_model=list[OrderResponse], status_code=status.HTTP_200_OK)
def get_orders(buyer_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.buyer_id == buyer_id).all()
    return [OrderResponse.model_validate(order) for order in orders]

@router.get("/orders/{order_id}", response_model=OrderResponse, status_code=status.HTTP_200_OK)
def get_order_by_id(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return OrderResponse.model_validate(order)
