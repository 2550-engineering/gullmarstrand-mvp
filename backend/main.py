from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.listings import router as listings_router
from backend.auth import router as auth_router
from backend.marketplace import router as marketplace_router
from backend.database import engine
from backend.models import Base

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(listings_router)
app.include_router(auth_router)
app.include_router(marketplace_router)

@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <html>
        <head><title>Marketplace API</title></head>
        <body>
            <h1>Marketplace API</h1>
            <p>Visit <a href='/docs'>/docs</a> for OpenAPI UI.</p>
        </body>
    </html>
    """

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

