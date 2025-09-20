import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app
from backend.models import Base, User, Category, Listing, Order
from backend.database import get_db
from datetime import datetime, timezone
import json

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_marketplace.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency for testing
@pytest.fixture(scope="function")
def override_get_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(override_get_db):
    app.dependency_overrides[get_db] = lambda: override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides = {}

@pytest.fixture(scope="function", autouse=True)
def setup_db_for_tests(override_get_db):
    db = override_get_db
    # Create test users
    user1 = User(email="test1@example.com", password_hash="hashed_pw1", email_verified=True, name="Test User 1", city="Test City")
    user2 = User(email="test2@example.com", password_hash="hashed_pw2", email_verified=True, name="Test User 2", city="Test City")
    db.add_all([user1, user2])
    db.commit()
    db.refresh(user1)
    db.refresh(user2)

    # Create test category
    category = Category(name="Electronics", slug="electronics", sort_order=1, icon="💻")
    db.add(category)
    db.commit()
    db.refresh(category)

    # Create test listing
    listing1 = Listing(
        user_id=user1.id,
        title="Test Listing 1",
        description="Description for test listing 1",
        price_sek=1000,
        condition="new",
        category_id=category.id,
        city="Test City",
        latitude=0.0,
        longitude=0.0,
        status="published",
        slug="test-listing-1",
        published_at=datetime.now(timezone.utc)
    )
    listing2 = Listing(
        user_id=user2.id,
        title="Test Listing 2",
        description="Description for test listing 2",
        price_sek=2000,
        condition="used",
        category_id=category.id,
        city="Test City",
        latitude=0.0,
        longitude=0.0,
        status="published",
        slug="test-listing-2",
        canonical_url="http://example.com/test-listing-2",
        published_at=datetime.now(timezone.utc)
    )
    db.add_all([listing1, listing2])
    db.commit()
    db.refresh(listing1)
    db.refresh(listing2)

def test_checkout_success(client, override_get_db):
    db = override_get_db
    user1 = db.query(User).filter(User.email == "test1@example.com").first()
    listing2 = db.query(Listing).filter(Listing.title == "Test Listing 2").first()

    data = {
        'buyer_id': user1.id,
        'listing_id': listing2.id,
        'delivery_type': 'flat',
        'delivery_address_line1': '123 Test St',
        'delivery_address_postal': '12345',
        'delivery_address_city': 'Testville',
        'delivery_address_country': 'Testland'
    }
    response = client.post("/marketplace/checkout", json=data)
    assert response.status_code == 201
    json_data = response.json()
    assert 'payment_intent_secret' in json_data
    assert 'order_id' in json_data

    # Verify order was created in DB
    order = db.query(Order).filter(Order.id == json_data['order_id']).first()
    assert order is not None

def test_checkout_buy_own_listing(client, override_get_db):
    db = override_get_db
    user1 = db.query(User).filter(User.email == "test1@example.com").first()
    listing1 = db.query(Listing).filter(Listing.title == "Test Listing 1").first()

    data = {
        'buyer_id': user1.id,
        'listing_id': listing1.id,
        'delivery_type': 'pickup'
    }
    response = client.post("/marketplace/checkout", json=data)
    assert response.status_code == 403
    json_data = response.json()
    assert json_data['detail'] == 'Cannot buy your own listing'

def test_checkout_listing_not_found(client, override_get_db):
    db = override_get_db
    user1 = db.query(User).filter(User.email == "test1@example.com").first()

    data = {
        'buyer_id': user1.id,
        'listing_id': 9999, # Non-existent listing
        'delivery_type': 'pickup'
    }
    response = client.post("/marketplace/checkout", json=data)
    assert response.status_code == 404
    json_data = response.json()
    assert json_data['detail'] == 'Listing not found'

def test_checkout_listing_not_available(client, override_get_db):
    db = override_get_db
    user1 = db.query(User).filter(User.email == "test1@example.com").first()
    listing2 = db.query(Listing).filter(Listing.title == "Test Listing 2").first()
    listing2.status = "sold" # Set listing to sold
    db.add(listing2)
    db.commit()

    data = {
        'buyer_id': user1.id,
        'listing_id': listing2.id,
        'delivery_type': 'pickup'
    }
    response = client.post("/marketplace/checkout", json=data)
    assert response.status_code == 400
    json_data = response.json()
    assert json_data['detail'] == 'Listing is not available for purchase'

def test_payments_webhook_success(client, override_get_db):
    db = override_get_db
    user1 = db.query(User).filter(User.email == "test1@example.com").first()
    listing2 = db.query(Listing).filter(Listing.title == "Test Listing 2").first()
    
    # Create an order first
    order = Order(
        buyer_id=user1.id,
        seller_id=listing2.user_id,
        listing_id=listing2.id,
        amount_sek=listing2.price_sek,
        delivery_type='flat',
        status='created',
        created_at=datetime.now(timezone.utc)
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    order_id = order.id
    listing2_id = listing2.id

    data = {
        'order_id': order_id,
        'payment_status': 'succeeded'
    }
    response = client.post("/marketplace/payments/webhook", json=data)
    assert response.status_code == 200
    json_data = response.json()
    assert f'Order {order_id} status updated to paid' in json_data['message']

    # Verify order and listing status in DB
    updated_order = db.query(Order).filter(Order.id == order_id).first()
    updated_listing = db.query(Listing).filter(Listing.id == listing2_id).first()
    assert updated_order.status == 'paid'
    # AUTO_FLIP_LISTING_TO_SOLD is True in marketplace.py
    assert updated_listing.status == 'sold'

def test_payments_webhook_failed(client, override_get_db):
    db = override_get_db
    user1 = db.query(User).filter(User.email == "test1@example.com").first()
    listing2 = db.query(Listing).filter(Listing.title == "Test Listing 2").first()
    
    # Create an order first
    order = Order(
        buyer_id=user1.id,
        seller_id=listing2.user_id,
        listing_id=listing2.id,
        amount_sek=listing2.price_sek,
        delivery_type='flat',
        status='created',
        created_at=datetime.now(timezone.utc)
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    order_id = order.id

    data = {
        'order_id': order_id,
        'payment_status': 'failed'
    }
    response = client.post("/marketplace/payments/webhook", json=data)
    assert response.status_code == 200
    json_data = response.json()
    assert f'Order {order_id} status updated to canceled' in json_data['message']

    # Verify order status in DB
    updated_order = db.query(Order).filter(Order.id == order_id).first()
    assert updated_order.status == 'canceled'

def test_payments_webhook_order_not_found(client):
    data = {
        'order_id': 9999, # Non-existent order
        'payment_status': 'succeeded'
    }
    response = client.post("/marketplace/payments/webhook", json=data)
    assert response.status_code == 404
    json_data = response.json()
    assert json_data['detail'] == 'Order not found'

def test_get_orders_success(client, override_get_db):
    db = override_get_db
    user1 = db.query(User).filter(User.email == "test1@example.com").first()
    listing2 = db.query(Listing).filter(Listing.title == "Test Listing 2").first()
    
    # Create an order for user1
    order = Order(
        buyer_id=user1.id,
        seller_id=listing2.user_id,
        listing_id=listing2.id,
        amount_sek=listing2.price_sek,
        delivery_type='pickup',
        status='paid',
        created_at=datetime.now(timezone.utc)
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    user1_id = user1.id
    order_id = order.id

    response = client.get(f"/marketplace/orders?buyer_id={user1_id}")
    assert response.status_code == 200
    json_data = response.json()
    assert len(json_data) > 0
    assert json_data[0]['id'] == order_id

def test_get_orders_no_orders(client, override_get_db):
    db = override_get_db
    user_no_orders = db.query(User).filter(User.email == "noorders@example.com").first()
    if not user_no_orders:
        user_no_orders = User(email="noorders@example.com", password_hash="hashed_pw_no_orders", email_verified=True, name="No Orders User", city="Test City")
        db.add(user_no_orders)
        db.commit()
        db.refresh(user_no_orders)

    response = client.get(f"/marketplace/orders?buyer_id={user_no_orders.id}")
    assert response.status_code == 200
    json_data = response.json()
    assert len(json_data) == 0

def test_get_orders_missing_buyer_id(client):
    response = client.get("/marketplace/orders")
    assert response.status_code == 422 # FastAPI validation error for missing query parameter

def test_get_order_by_id_success(client, override_get_db):
    db = override_get_db
    user1 = db.query(User).filter(User.email == "test1@example.com").first()
    listing2 = db.query(Listing).filter(Listing.title == "Test Listing 2").first()
    
    # Create an order for user1
    order = Order(
        buyer_id=user1.id,
        seller_id=listing2.user_id,
        listing_id=listing2.id,
        amount_sek=listing2.price_sek,
        delivery_type='pickup',
        status='paid',
        created_at=datetime.now(timezone.utc)
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    user1_id = user1.id
    order_id = order.id

    response = client.get(f"/marketplace/orders/{order_id}")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data['id'] == order_id
    assert json_data['buyer_id'] == user1_id

def test_get_order_by_id_not_found(client):
    response = client.get("/marketplace/orders/9999") # Non-existent order
    assert response.status_code == 404
    json_data = response.json()
    assert json_data['detail'] == 'Order not found'