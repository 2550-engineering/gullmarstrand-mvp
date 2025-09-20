from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Listing, ListingImage

engine = create_engine("sqlite:///marketplace.db")
Session = sessionmaker(bind=engine)
session = Session()

def update_listing_image(listing_title_keyword, image_url):
    listing = session.query(Listing).filter(Listing.title.ilike(f"%{listing_title_keyword}%")).first()
    if not listing:
        print(f"Listing with keyword '{listing_title_keyword}' not found.")
        return

    img = session.query(ListingImage).filter(ListingImage.listing_id == listing.id).first()
    if img:
        img.url_full = image_url
        img.url_card = image_url
        img.url_thumb = image_url
        print(f"Updated existing image for '{listing.title}'.")
    else:
        img = ListingImage(
            listing_id=listing.id,
            url_full=image_url,
            url_card=image_url,
            url_thumb=image_url,
            blurhash="",
            sort_order=1
        )
        session.add(img)
        print(f"Added new image for '{listing.title}'.")

def main():
    update_listing_image(
        "iphone",
        "https://buy.gazelle.com/cdn/shop/files/iPhone_13_-_Midnight_-_Flat_240f83c4-80cd-40e0-b576-6e1a5e702da6.jpg?v=1757019221&width=1946"
    )
    update_listing_image(
        "sofa",
        "https://www.sofalistic.co.uk/wp-content/smush-webp/2024/10/WhatsApp-Gorsel-2024-10-21-saat-20.28.01_99cc7907.jpg.webp"
    )
    session.commit()
    print("Done.")

if __name__ == "__main__":
    main()