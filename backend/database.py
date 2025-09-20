import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Get the directory of the current file
# and join it with the database file name
# to create an absolute path.
# This makes the database location independent of the current working directory.
DATABASE_FILE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "marketplace.db"))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_FILE_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
