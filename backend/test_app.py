import pytest
import app as flask_app_module
from sqlalchemy import create_engine
from models import User, Category, Listing, Order
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone
import json

@pytest.fixture(scope='function')
def client():
    flask_app_module.app.config['TESTING'] = True
    with flask_app_module.app.test_client() as client:
        with flask_app_module.app.app_context():
            # Use an in-memory SQLite database for testing
            test_engine = create_engine('sqlite:///:memory:')
            flask_app_module.Base.metadata.create_all(test_engine)
            TestSession = sessionmaker(bind=test_engine)
            
            # Override the app's Session with the test session
            flask_app_module.app.config['TEST_SESSION'] = TestSession

            # Establish a session for the test and begin a transaction
            test_session = TestSession()
            flask_app_module.db_session = test_session # Make the test session available to the app
            test_session.begin_nested() # Start a savepoint

            # Populate with dummy data for tests
            # Create test users
            user1 = User(email="test1@example.com", password_hash="hashed_pw1", email_verified=True, name="Test User 1", city="Test City")
            user2 = User(email="test2@example.com", password_hash="hashed_pw2", email_verified=True, name="Test User 2", city="Test City")
            test_session.add_all([user1, user2])
            test_session.commit()
            test_session.refresh(user1)
            test_session.refresh(user2)

            # Create test category
            category = Category(name="Electronics", slug="electronics", sort_order=1, icon="💻")
            test_session.add(category)
            test_session.commit()
            test_session.refresh(category)

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
            test_session.add_all([listing1, listing2])
            test_session.commit()
            test_session.refresh(listing1)
            test_session.refresh(listing2)

        yield client

        with flask_app_module.app.app_context():
            test_session.rollback() # Rollback the transaction
            test_session.close()
            flask_app_module.Base.metadata.drop_all(test_engine)

# Helper function to get a test session
def get_test_session():
    return flask_app_module.app.config['TEST_SESSION']()


def test_hello_world(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'Hello, Flask API!' in response.data

def test_checkout_success(client):
    test_session = get_test_session()
    user1 = test_session.query(User).filter_by(email="test1@example.com").first()
    listing2 = test_session.query(Listing).filter_by(title="Test Listing 2").first()
    user1_id = user1.id
    listing2_id = listing2.id

    data = {
        'buyer_id': user1_id,
        'listing_id': listing2_id,
        'delivery_type': 'flat',
        'delivery_address_line1': '123 Test St',
        'delivery_address_postal': '12345',
        'delivery_address_city': 'Testville',
        'delivery_address_country': 'Testland'
    }
    response = client.post('/checkout', data=json.dumps(data), content_type='application/json')
    assert response.status_code == 201
    json_data = json.loads(response.data)
    assert 'payment_intent_secret' in json_data
    assert 'order_id' in json_data

    # Verify order was created in DB
    test_session = get_test_session()
    order = test_session.query(Order).filter_by(id=json_data['order_id']).first()
    assert order is not None

def test_checkout_buy_own_listing(client):
    test_session = get_test_session()
    user1 = test_session.query(User).filter_by(email="test1@example.com").first()
    listing1 = test_session.query(Listing).filter_by(title="Test Listing 1").first()

    data = {
        'buyer_id': user1.id,
        'listing_id': listing1.id,
        'delivery_type': 'pickup'
    }
    response = client.post('/checkout', data=json.dumps(data), content_type='application/json')
    assert response.status_code == 403
    json_data = json.loads(response.data)
    assert json_data['error'] == 'Cannot buy your own listing'

def test_checkout_listing_not_found(client):
    test_session = get_test_session()
    user1 = test_session.query(User).filter_by(email="test1@example.com").first()

    data = {
        'buyer_id': user1.id,
        'listing_id': 9999, # Non-existent listing
        'delivery_type': 'pickup'
    }
    response = client.post('/checkout', data=json.dumps(data), content_type='application/json')
    assert response.status_code == 404
    json_data = json.loads(response.data)
    assert json_data['error'] == 'Listing not found'

def test_checkout_missing_fields(client):
    test_session = get_test_session()
    user1 = test_session.query(User).filter_by(email="test1@example.com").first()
    listing2 = test_session.query(Listing).filter_by(title="Test Listing 2").first()

    data = {
        'buyer_id': user1.id,
        'listing_id': listing2.id,
        # Missing delivery_type
    }
    response = client.post('/checkout', data=json.dumps(data), content_type='application/json')
    assert response.status_code == 400
    json_data = json.loads(response.data)
    assert json_data['error'] == 'Missing required fields'


def test_payments_webhook_success(client):
    test_session = get_test_session()
    user1 = test_session.query(User).filter_by(email="test1@example.com").first()
    listing2 = test_session.query(Listing).filter_by(title="Test Listing 2").first()

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
    test_session.add(order)
    test_session.commit()
    test_session.refresh(order)
    order_id = order.id
    listing2_id = listing2.id
    test_session.close()

    data = {
        'order_id': order_id,
        'payment_status': 'succeeded'
    }
    response = client.post('/payments/webhook', data=json.dumps(data), content_type='application/json')
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert f'Order {order_id} status updated to paid' in json_data['message']

    # Verify order and listing status in DB
    test_session = get_test_session()
    updated_order = test_session.query(Order).filter_by(id=order_id).first()
    updated_listing = test_session.query(Listing).filter_by(id=listing2_id).first()
    assert updated_order.status == 'paid'
    if flask_app_module.AUTO_FLIP_LISTING_TO_SOLD:
        assert updated_listing.status == 'sold'

def test_payments_webhook_failed(client):
    test_session = get_test_session()
    user1 = test_session.query(User).filter_by(email="test1@example.com").first()
    listing2 = test_session.query(Listing).filter_by(title="Test Listing 2").first()
    
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
    test_session.add(order)
    test_session.commit()
    test_session.refresh(order)
    order_id = order.id
    test_session.close()

    data = {
        'order_id': order_id,
        'payment_status': 'failed'
    }
    response = client.post('/payments/webhook', data=json.dumps(data), content_type='application/json')
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert f'Order {order_id} status updated to canceled' in json_data['message']

    # Verify order status in DB
    test_session = get_test_session()
    updated_order = test_session.query(Order).filter_by(id=order_id).first()
    assert updated_order.status == 'canceled'

def test_payments_webhook_order_not_found(client):
    data = {
        'order_id': 9999, # Non-existent order
        'payment_status': 'succeeded'
    }
    response = client.post('/payments/webhook', data=json.dumps(data), content_type='application/json')
    assert response.status_code == 404
    json_data = json.loads(response.data)
    assert json_data['error'] == 'Order not found'

def test_get_orders_success(client):
    test_session = get_test_session()
    user1 = test_session.query(User).filter_by(email="test1@example.com").first()
    listing2 = test_session.query(Listing).filter_by(title="Test Listing 2").first()
    
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
    test_session.add(order)
    test_session.commit()
    test_session.refresh(order)
    user1_id = user1.id
    order_id = order.id

    response = client.get(f'/orders?buyer_id={user1_id}')
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert len(json_data) > 0
    assert json_data[0]['id'] == order_id

def test_get_orders_no_orders(client):
    test_session = get_test_session()
    user_no_orders = User(email="noorders@example.com", password_hash="hashed_pw_no_orders", email_verified=True, name="No Orders User", city="Test City")
    test_session.add(user_no_orders)
    test_session.commit()
    test_session.refresh(user_no_orders)

    response = client.get(f'/orders?buyer_id={user_no_orders.id}')
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert len(json_data) == 0

def test_get_orders_missing_buyer_id(client):
    response = client.get('/orders')
    assert response.status_code == 400
    json_data = json.loads(response.data)
    assert json_data['error'] == 'buyer_id is required'

def test_get_order_by_id_success(client):
    test_session = get_test_session()
    user1 = test_session.query(User).filter_by(email="test1@example.com").first()
    listing2 = test_session.query(Listing).filter_by(title="Test Listing 2").first()
    
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
    test_session.add(order)
    test_session.commit()
    test_session.refresh(order)
    user1_id = user1.id
    order_id = order.id

    response = client.get(f'/orders/{order_id}')
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['id'] == order_id
    assert json_data['buyer_id'] == user1_id

def test_get_order_by_id_not_found(client):
    response = client.get('/orders/9999') # Non-existent order
    assert response.status_code == 404
    json_data = json.loads(response.data)
    assert json_data['error'] == 'Order not found'
