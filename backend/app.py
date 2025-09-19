from flask import Flask, request, jsonify
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, User, Category, Listing, ListingImage, ListingReport, Order
import os
import uuid
from datetime import datetime, timezone

DATABASE_URL = "sqlite:///marketplace.db"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

app = Flask(__name__)

AUTO_FLIP_LISTING_TO_SOLD = True # Define the configuration variable
from flask_swagger_ui import get_swaggerui_blueprint

### swagger specific ###
SWAGGER_URL = '/docs'
API_URL = '/static/swagger.json'
SWAGGERUI_BLUEPRINT = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Marketplace API"
    }
)
app.register_blueprint(SWAGGERUI_BLUEPRINT, url_prefix=SWAGGER_URL)
### end swagger specific ###

@app.route(API_URL)
def swagger_spec():
    return jsonify({
        "swagger": "2.0",
        "info": {
            "title": "Marketplace API",
            "description": "API for the marketplace application",
            "version": "1.0.0"
        },
        "paths": {
            "/checkout": {
                "post": {
                    "summary": "Initiate a checkout process",
                    "parameters": [
                        {"name": "buyer_id", "in": "body", "required": True, "type": "integer"},
                        {"name": "listing_id", "in": "body", "required": True, "type": "integer"},
                        {"name": "delivery_type", "in": "body", "required": True, "type": "string", "enum": ["pickup", "flat"]},
                        {"name": "delivery_address_line1", "in": "body", "required": False, "type": "string"},
                        {"name": "delivery_address_postal", "in": "body", "required": False, "type": "string"},
                        {"name": "delivery_address_city", "in": "body", "required": False, "type": "string"},
                        {"name": "delivery_address_country", "in": "body", "required": False, "type": "string"}
                    ],
                    "responses": {
                        "201": {"description": "Order created successfully"},
                        "400": {"description": "Missing required fields or invalid data"},
                        "403": {"description": "Cannot buy your own listing"},
                        "404": {"description": "Listing not found"},
                        "500": {"description": "Internal server error"}
                    }
                }
            },
            "/payments/webhook": {
                "post": {
                    "summary": "Handle payment gateway webhooks",
                    "parameters": [
                        {"name": "order_id", "in": "body", "required": True, "type": "integer"},
                        {"name": "payment_status", "in": "body", "required": True, "type": "string", "enum": ["succeeded", "failed"]}
                    ],
                    "responses": {
                        "200": {"description": "Order status updated"},
                        "400": {"description": "Missing required fields"},
                        "404": {"description": "Order not found"},
                        "500": {"description": "Internal server error"}
                    }
                }
            },
            "/orders": {
                "get": {
                    "summary": "Get buyer's order history",
                    "parameters": [
                        {"name": "buyer_id", "in": "query", "required": True, "type": "integer"}
                    ],
                    "responses": {
                        "200": {"description": "List of orders"},
                        "400": {"description": "buyer_id is required"},
                        "500": {"description": "Internal server error"}
                    }
                }
            },
            "/orders/{order_id}": {
                "get": {
                    "summary": "Get details for a specific order",
                    "parameters": [
                        {"name": "order_id", "in": "path", "required": True, "type": "integer"}
                    ],
                    "responses": {
                        "200": {"description": "Order details"},
                        "404": {"description": "Order not found"},
                        "500": {"description": "Internal server error"}
                    }
                }
            }
        }
    })

app = Flask(__name__)

from flask_swagger_ui import get_swaggerui_blueprint

### swagger specific ###
SWAGGER_URL = '/docs'
API_URL = '/static/swagger.json'
SWAGGERUI_BLUEPRINT = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Marketplace API"
    }
)
app.register_blueprint(SWAGGERUI_BLUEPRINT, url_prefix=SWAGGER_URL)
### end swagger specific ###

@app.route(API_URL)
def swagger_spec():
    return jsonify({
        "swagger": "2.0",
        "info": {
            "title": "Marketplace API",
            "description": "API for the marketplace application",
            "version": "1.0.0"
        },
        "paths": {
            "/checkout": {
                "post": {
                    "summary": "Initiate a checkout process",
                    "parameters": [
                        {"name": "buyer_id", "in": "body", "required": True, "type": "integer"},
                        {"name": "listing_id", "in": "body", "required": True, "type": "integer"},
                        {"name": "delivery_type", "in": "body", "required": True, "type": "string", "enum": ["pickup", "flat"]},
                        {"name": "delivery_address_line1", "in": "body", "required": False, "type": "string"},
                        {"name": "delivery_address_postal", "in": "body", "required": False, "type": "string"},
                        {"name": "delivery_address_city", "in": "body", "required": False, "type": "string"},
                        {"name": "delivery_address_country", "in": "body", "required": False, "type": "string"}
                    ],
                    "responses": {
                        "201": {"description": "Order created successfully"},
                        "400": {"description": "Missing required fields or invalid data"},
                        "403": {"description": "Cannot buy your own listing"},
                        "404": {"description": "Listing not found"},
                        "500": {"description": "Internal server error"}
                    }
                }
            },
            "/payments/webhook": {
                "post": {
                    "summary": "Handle payment gateway webhooks",
                    "parameters": [
                        {"name": "order_id", "in": "body", "required": True, "type": "integer"},
                        {"name": "payment_status", "in": "body", "required": True, "type": "string", "enum": ["succeeded", "failed"]}
                    ],
                    "responses": {
                        "200": {"description": "Order status updated"},
                        "400": {"description": "Missing required fields"},
                        "404": {"description": "Order not found"},
                        "500": {"description": "Internal server error"}
                    }
                }
            },
            "/orders": {
                "get": {
                    "summary": "Get buyer's order history",
                    "parameters": [
                        {"name": "buyer_id", "in": "query", "required": True, "type": "integer"}
                    ],
                    "responses": {
                        "200": {"description": "List of orders"},
                        "400": {"description": "buyer_id is required"},
                        "500": {"description": "Internal server error"}
                    }
                }
            },
            "/orders/{order_id}": {
                "get": {
                    "summary": "Get details for a specific order",
                    "parameters": [
                        {"name": "order_id", "in": "path", "required": True, "type": "integer"}
                    ],
                    "responses": {
                        "200": {"description": "Order details"},
                        "404": {"description": "Order not found"},
                        "500": {"description": "Internal server error"}
                    }
                }
            }
        }
    })

# Configuration for auto-flipping listing to sold

@app.route('/')
def hello_world():
    return 'Hello, Flask API!'

@app.route('/checkout', methods=['POST'])
def checkout():
    db_session = app.config['TEST_SESSION']() if app.config.get('TESTING') else Session()
    try:
        data = request.get_json()
        buyer_id = data.get('buyer_id')
        listing_id = data.get('listing_id')
        delivery_type = data.get('delivery_type')
        delivery_address_line1 = data.get('delivery_address_line1')
        delivery_address_postal = data.get('delivery_address_postal')
        delivery_address_city = data.get('delivery_address_city')
        delivery_address_country = data.get('delivery_address_country')

        if not all([buyer_id, listing_id, delivery_type]):
            return jsonify({"error": "Missing required fields"}), 400

        listing = db_session.query(Listing).filter_by(id=listing_id).first()
        if not listing:
            return jsonify({"error": "Listing not found"}), 404

        if listing.user_id == buyer_id:
            return jsonify({"error": "Cannot buy your own listing"}), 403
        
        if listing.status != 'published':
            return jsonify({"error": "Listing is not available for purchase"}), 400

        # Create a new order
        new_order = Order(
            buyer_id=buyer_id,
            seller_id=listing.user_id,
            listing_id=listing_id,
            amount_sek=listing.price_sek,
            delivery_type=delivery_type,
            delivery_address_line1=delivery_address_line1,
            delivery_address_postal=delivery_address_postal,
            delivery_address_city=delivery_address_city,
            delivery_address_country=delivery_address_country,
            status='created',
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(new_order)
        db_session.commit()
        db_session.refresh(new_order)

        # Simulate payment intent secret
        payment_intent_secret = str(uuid.uuid4())

        return jsonify({
            "payment_intent_secret": payment_intent_secret,
            "order_id": new_order.id
        }), 201

    except Exception as e:
        db_session.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db_session.close()

@app.route('/payments/webhook', methods=['POST'])
def payments_webhook():
    db_session = app.config['TEST_SESSION']() if app.config.get('TESTING') else Session()
    try:
        data = request.get_json()
        order_id = data.get('order_id')
        payment_status = data.get('payment_status') # e.g., 'succeeded', 'failed'

        if not all([order_id, payment_status]):
            return jsonify({"error": "Missing required fields"}), 400

        order = db_session.query(Order).filter_by(id=order_id).first()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        if payment_status == 'succeeded':
            order.status = 'paid'
            # Auto-flip listing to sold
            if AUTO_FLIP_LISTING_TO_SOLD:
                listing = db_session.query(Listing).filter_by(id=order.listing_id).first()
                if listing:
                    listing.status = 'sold'
            
            # Simulate sending receipt email
            print(f"Simulating receipt email for order {order.id} to buyer {order.buyer_id}")

        elif payment_status == 'failed':
            order.status = 'canceled' # Or a more specific failed status
        
        db_session.flush()
        db_session.commit()
        db_session.refresh(order)

        return jsonify({"message": f"Order {order.id} status updated to {order.status}"}), 200

    except Exception as e:
        db_session.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db_session.close()

@app.route('/orders', methods=['GET'])
def get_orders():
    db_session = app.config['TEST_SESSION']() if app.config.get('TESTING') else Session()
    try:
        # For simplicity, assuming buyer_id is passed as a query parameter or from a dummy auth
        buyer_id = request.args.get('buyer_id', type=int)
        if not buyer_id:
            return jsonify({"error": "buyer_id is required"}), 400

        orders = db_session.query(Order).filter_by(buyer_id=buyer_id).all()
        
        orders_data = []
        for order in orders:
            orders_data.append({
                "id": order.id,
                "buyer_id": order.buyer_id,
                "seller_id": order.seller_id,
                "listing_id": order.listing_id,
                "amount_sek": order.amount_sek,
                "delivery_type": order.delivery_type,
                "delivery_address_line1": order.delivery_address_line1,
                "delivery_address_postal": order.delivery_address_postal,
                "delivery_address_city": order.delivery_address_city,
                "delivery_address_country": order.delivery_address_country,
                "status": order.status,
                "created_at": order.created_at.isoformat()
            })
        return jsonify(orders_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db_session.close()

@app.route('/orders/<int:order_id>', methods=['GET'])
def get_order_by_id(order_id):
    db_session = app.config['TEST_SESSION']() if app.config.get('TESTING') else Session()
    try:
        order = db_session.query(Order).filter_by(id=order_id).first()
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        order_data = {
            "id": order.id,
            "buyer_id": order.buyer_id,
            "seller_id": order.seller_id,
            "listing_id": order.listing_id,
            "amount_sek": order.amount_sek,
            "delivery_type": order.delivery_type,
            "delivery_address_line1": order.delivery_address_line1,
            "delivery_address_postal": order.delivery_address_postal,
            "delivery_address_city": order.delivery_address_city,
            "delivery_address_country": order.delivery_address_country,
            "status": order.status,
            "created_at": order.created_at.isoformat()
        }
        return jsonify(order_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db_session.close()

if __name__ == '__main__':
    # Ensure the database and some dummy data exist for testing
    # In a real application, you'd have proper migration and seeding
    from create_db import main as create_db_main
    from populate_db import main as populate_db_main
    
    if not os.path.exists('marketplace.db'):
        print("Database not found, creating and populating...")
        create_db_main()
        populate_db_main()
    
    app.run(debug=True, port=5001)
