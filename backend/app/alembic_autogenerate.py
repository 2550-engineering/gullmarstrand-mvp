from sqlmodel import SQLModel
from app.database import engine

def run():
    SQLModel.metadata.create_all(engine)

if __name__ == "__main__":
    run()
