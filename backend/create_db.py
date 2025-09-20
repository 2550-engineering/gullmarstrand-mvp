import os
from sqlalchemy import create_engine
from models import Base

def main():
    DATABASE_FILE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "marketplace.db"))
    engine = create_engine(f"sqlite:///{DATABASE_FILE_PATH}")
    Base.metadata.create_all(engine)
    print("SQLite database and tables created successfully.")

if __name__ == "__main__":
    main()