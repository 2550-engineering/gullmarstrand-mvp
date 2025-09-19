from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from backend.auth import router as auth_router
from backend.marketplace import router as marketplace_router

app = FastAPI()
app.include_router(auth_router)
app.include_router(marketplace_router)

@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <html>
        <head><title>Auth Test Page</title></head>
        <body>
            <h1>Welcome to the Auth API Test Page</h1>
            <p>Try the following endpoints with a tool like <a href='https://hoppscotch.io/'>Hoppscotch</a> or <a href='https://www.postman.com/'>Postman</a>:</p>
            <ul>
                <li>POST /auth/register</li>
                <li>POST /auth/login</li>
                <li>POST /auth/verify-email</li>
                <li>POST /auth/forgot</li>
            </ul>
            <p>Or use the <a href='/docs'>OpenAPI docs</a> for interactive testing.</p>
        </body>
    </html>
    """
