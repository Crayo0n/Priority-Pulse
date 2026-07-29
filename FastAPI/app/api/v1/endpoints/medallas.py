from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.medalla import MedallaCreate, MedallaResponse, MedallaUpdate, UsuarioMedallaCreate, UsuarioMedallaResponse
from app.crud import crud_medalla
from app.core.limiter import limiter
from app.api.deps import validar_api_key, obtener_usuario_actual, requiere_rol
from app.models.usuario import Usuario

router = APIRouter()

# --- Endpoints del Catálogo de Medallas ---
@router.post("/", response_model=MedallaResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def create_medalla(
    request: Request,
    medalla: MedallaCreate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(requiere_rol("admin")),
    db: Session = Depends(get_db)
):
    # RBAC: Only admin can create medals
    db_medalla = crud_medalla.crear_medalla(db=db, medalla=medalla)
    # Disparar evaluación automática para todos los usuarios existentes al crear nueva regla
    try:
        crud_medalla.evaluar_y_otorgar_medallas_todos(db=db)
    except Exception:
        pass
    return db_medalla


@router.post("/evaluar-todos", summary="Evaluar reglas de medallas para todos los jugadores")
@limiter.limit("10/minute")
def evaluar_medallas_todos(
    request: Request,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(requiere_rol("admin")),
    db: Session = Depends(get_db)
):
    total = crud_medalla.evaluar_y_otorgar_medallas_todos(db=db)
    return {"ok": True, "total_otorgadas": total}


@router.post("/evaluar/{usuario_id}", summary="Evaluar reglas de medallas para un usuario específico")
@limiter.limit("30/minute")
def evaluar_medallas_usuario(
    request: Request,
    usuario_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    nuevas = crud_medalla.evaluar_y_otorgar_medallas(db=db, usuario_id=usuario_id)
    return {"ok": True, "nuevas_desbloqueadas": len(nuevas)}


@router.get("/", response_model=List[MedallaResponse])
@limiter.limit("30/minute")
def read_medallas(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    return crud_medalla.get_medallas(db, skip=skip, limit=limit)


@router.get("/{medalla_id}", response_model=MedallaResponse)
@limiter.limit("30/minute")
def read_medalla(
    request: Request,
    medalla_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_medalla = crud_medalla.get_medalla(db, medalla_id=medalla_id)
    if db_medalla is None:
        raise HTTPException(status_code=404, detail="Medalla no encontrada")
    return db_medalla


@router.put("/{medalla_id}", response_model=MedallaResponse)
@limiter.limit("10/minute")
def update_medalla(
    request: Request,
    medalla_id: int,
    medalla_in: MedallaUpdate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(requiere_rol("admin")),
    db: Session = Depends(get_db)
):
    # RBAC: Only admin can update medals
    db_medalla = crud_medalla.get_medalla(db, medalla_id=medalla_id)
    if db_medalla is None:
        raise HTTPException(status_code=404, detail="Medalla no encontrada")
    return crud_medalla.actualizar_medalla(db=db, db_medalla=db_medalla, medalla_update=medalla_in)


@router.delete("/{medalla_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
def delete_medalla(
    request: Request,
    medalla_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(requiere_rol("admin")),
    db: Session = Depends(get_db)
):
    # RBAC: Only admin can delete medals
    db_medalla = crud_medalla.get_medalla(db, medalla_id=medalla_id)
    if db_medalla is None:
        raise HTTPException(status_code=404, detail="Medalla no encontrada")
    crud_medalla.eliminar_medalla(db=db, medalla_id=medalla_id)
    return None

# --- Endpoints de Asignación (Logros Desbloqueados) ---
@router.post("/otorgar", response_model=UsuarioMedallaResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def otorgar_medalla_a_usuario(
    request: Request,
    otorgar_data: UsuarioMedallaCreate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(requiere_rol("admin")),
    db: Session = Depends(get_db)
):
    # RBAC: Only admin can grant/award medals
    db_medalla = crud_medalla.get_medalla(db, medalla_id=otorgar_data.medalla_id)
    if db_medalla is None:
        raise HTTPException(status_code=404, detail="La medalla asignada no existe en el catálogo")
    return crud_medalla.otorgar_medalla(db=db, usuario_medalla=otorgar_data)


@router.get("/usuario/{usuario_id}", response_model=List[UsuarioMedallaResponse])
@limiter.limit("30/minute")
def read_medallas_de_usuario(
    request: Request,
    usuario_id: int,
    skip: int = 0,
    limit: int = 100,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection: A user can only view their own medals unless they are admin (or let users view anyone's public badges)
    # Since profile medals are typically public to promote gamified sharing, let's allow all authenticated users to read.
    return crud_medalla.get_medallas_by_usuario(db, usuario_id=usuario_id, skip=skip, limit=limit)
