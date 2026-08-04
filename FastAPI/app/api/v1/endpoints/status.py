from fastapi import APIRouter, Request
from app.core.limiter import limiter

router = APIRouter()

@router.get("/")
@limiter.limit("5/minute")
def get_status(request: Request):
    """
    Endpoint de prueba para verificar que el API está activa.
    """
    return {"status": "ok", "service": "FastAPI is running"}
