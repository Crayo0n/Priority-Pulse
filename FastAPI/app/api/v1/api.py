from fastapi import APIRouter
from app.api.v1.endpoints import status, usuarios

api_router = APIRouter()
api_router.include_router(status.router, prefix="/status", tags=["Status"])
api_router.include_router(usuarios.router, prefix="/usuarios", tags=["Usuarios"])
