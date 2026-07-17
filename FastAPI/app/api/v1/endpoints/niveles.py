from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.nivel import NivelCreate, NivelResponse, NivelUpdate
from app.crud import crud_nivel
from app.core.limiter import limiter
from app.api.deps import validar_api_key, obtener_usuario_actual, requiere_rol
from app.models.usuario import Usuario

router = APIRouter()


@router.post("/", response_model=NivelResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def create_nivel(
    request: Request,
    nivel: NivelCreate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(requiere_rol("admin")),
    db: Session = Depends(get_db)
):
    # RBAC: Only admin can create level mappings
    return crud_nivel.crear_nivel(db=db, nivel=nivel)


@router.get("/", response_model=List[NivelResponse])
@limiter.limit("30/minute")
def read_niveles(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    return crud_nivel.get_niveles(db, skip=skip, limit=limit)


@router.get("/{nivel_id}", response_model=NivelResponse)
@limiter.limit("30/minute")
def read_nivel(
    request: Request,
    nivel_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_nivel = crud_nivel.get_nivel(db, nivel_id=nivel_id)
    if db_nivel is None:
        raise HTTPException(status_code=404, detail="Nivel no encontrado")
    return db_nivel


@router.put("/{nivel_id}", response_model=NivelResponse)
@limiter.limit("10/minute")
def update_nivel(
    request: Request,
    nivel_id: int,
    nivel_in: NivelUpdate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(requiere_rol("admin")),
    db: Session = Depends(get_db)
):
    # RBAC: Only admin can update level configurations
    db_nivel = crud_nivel.get_nivel(db, nivel_id=nivel_id)
    if db_nivel is None:
        raise HTTPException(status_code=404, detail="Nivel no encontrado")
    return crud_nivel.actualizar_nivel(db=db, db_nivel=db_nivel, nivel_update=nivel_in)


@router.delete("/{nivel_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
def delete_nivel(
    request: Request,
    nivel_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(requiere_rol("admin")),
    db: Session = Depends(get_db)
):
    # RBAC: Only admin can delete level mappings
    db_nivel = crud_nivel.get_nivel(db, nivel_id=nivel_id)
    if db_nivel is None:
        raise HTTPException(status_code=404, detail="Nivel no encontrado")
    crud_nivel.eliminar_nivel(db=db, nivel_id=nivel_id)
    return None
