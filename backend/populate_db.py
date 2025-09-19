from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, User, Category, Listing, ListingImage, ListingReport, Order
from datetime import datetime

engine = create_engine("sqlite:///marketplace.db")
Session = sessionmaker(bind=engine)
session = Session()

def main():
    # Create example users
    user1 = User(
        email="alice@example.com",
        password_hash="hashed_pw1",
        email_verified=True,
        name="Alice",
        city="Gothenburg",
        avatar_url="https://example.com/avatar1.png"
    )
    user2 = User(
        email="bob@example.com",
        password_hash="hashed_pw2",
        email_verified=False,
        name="Bob",
        city="Stockholm",
        avatar_url="https://example.com/avatar2.png"
    )
    session.add_all([user1, user2])
    session.commit()

    # Create example categories
    cat1 = Category(name="Electronics", slug="electronics", sort_order=1, icon="💻")
    cat2 = Category(name="Furniture", slug="furniture", sort_order=2, icon="🛋️")
    session.add_all([cat1, cat2])
    session.commit()

    # Create example listings
    listing1 = Listing(
        user_id=user1.id,
        title="iPhone 13 Pro",
        description="A barely used iPhone 13 Pro, 128GB, graphite.",
        price_sek=9000,
        condition="like_new",
        category_id=cat1.id,
        city="Gothenburg",
        latitude=57.7089,
        longitude=11.9746,
        status="published",
        slug="iphone-13-pro",
        canonical_url="https://example.com/listings/iphone-13-pro",
        published_at=datetime.utcnow()
    )
    listing2 = Listing(
        user_id=user2.id,
        title="Sofa, 3-seater",
        description="Comfortable 3-seater sofa, blue fabric.",
        price_sek=1500,
        condition="good",
        category_id=cat2.id,
        city="Stockholm",
        latitude=59.3293,
        longitude=18.0686,
        status="published",
        slug="sofa-3-seater",
        canonical_url="https://example.com/listings/sofa-3-seater",
        published_at=datetime.utcnow()
    )
    session.add_all([listing1, listing2])
    session.commit()

    # Add images to listings
    img1 = ListingImage(
        listing_id=listing1.id,
        url_full="https://example.com/images/iphone-full.jpg",
        url_card="https://example.com/images/iphone-card.jpg",
        url_thumb="https://example.com/images/iphone-thumb.jpg",
        blurhash="LKO2?U%2Tw=w]~RBVZRi};RPxuwH",
        sort_order=1
    )
    img2 = ListingImage(
        listing_id=listing2.id,
        url_full="https://example.com/images/sofa-full.jpg",
        url_card="https://example.com/images/sofa-card.jpg",
        url_thumb="https://example.com/images/sofa-thumb.jpg",
        blurhash="L5H2EC=PM+yV0g-mq.wG9c010J}I",
        sort_order=1
    )
    session.add_all([img1, img2])
    session.commit()

    # Add a report
    report1 = ListingReport(
        listing_id=listing2.id,
        reporter_id=user1.id,
        reason_code="prohibited",
        note="This listing violates the rules.",
    )
    session.add(report1)
    session.commit()

    # Add an order
    order1 = Order(
        buyer_id=user2.id,
        seller_id=user1.id,
        listing_id=listing1.id,
        amount_sek=9000,
        delivery_type="pickup",
        delivery_address_line1="Main Street 1",
        delivery_address_postal="41101",
        delivery_address_city="Gothenburg",
        delivery_address_country="Sweden",
        status="created"
    )
    session.add(order1)
    session.commit()

    print("Database populated with example data.")

if __name__ == "__main__":
    main()