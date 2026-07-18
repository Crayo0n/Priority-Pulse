from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.historial_xp import HistorialXpCreate, HistorialXpResponse
from app.crud import crud_historial_xp
from app.core.limiter import limiter
from app.api.deps import validar_api_key, obtener_usuario_actual
from app.models.usuario import Usuario

router = APIRouter()


@router.post("/", response_model=HistorialXpResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def create_historial_xp(
    request: Request,
    registro: HistorialXpCreate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection: A user can only log XP for themselves unless they are admin
    if registro.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes registrar XP para otro usuario"
            }
        )
    return crud_historial_xp.crear_registro_xp(db=db, registro_xp=registro)


@router.get("/usuario/{usuario_id}", response_model=List[HistorialXpResponse])
@limiter.limit("30/minute")
def read_historial_usuario(
    request: Request,
    usuario_id: int,
    skip: int = 0,
    limit: int = 100,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection: A user can only view their own XP history
    if usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes consultar el historial de XP de otro usuario"
            }
        )
    return crud_historial_xp.get_historiales_por_usuario(db, usuario_id=usuario_id, skip=skip, limit=limit)


@router.get("/{historial_id}", response_model=HistorialXpResponse)
@limiter.limit("30/minute")
def read_historial(
    request: Request,
    historial_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_historial = crud_historial_xp.get_historial_xp(db, historial_id=historial_id)
    if db_historial is None:
        raise HTTPException(status_code=404, detail="Registro de XP no encontrado")
        
    # IDOR/BOLA Protection: Only owner or admin can read this log
    if db_historial.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes consultar este registro de XP"
            }
        )
    return db_historial
