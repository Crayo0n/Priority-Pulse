from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.limiter import limiter
from app.db.database import engine, Base
import app.models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/v1/openapi.json"
)

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "error": "Demasiadas solicitudes",
            "mensaje": "Has excedido el limite permitido. Intenta mas tarde.",
            "detalle": str(exc.detail)
        }
    )

# Incluyendo los routers
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Bienvenido a la API de PI-2026"}

