from sqlalchemy import create_engine
from models import Base

def main():
    engine = create_engine("sqlite:///marketplace.db")
    Base.metadata.create_all(engine)
    print("SQLite database and tables created successfully.")

if __name__ == "__main__":
    main()