from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.rutina import RutinaCreate, RutinaResponse, RutinaUpdate, RegistroRutinaCreate, RegistroRutinaResponse
from app.crud import crud_rutina
from app.core.limiter import limiter
from app.api.deps import validar_api_key, obtener_usuario_actual
from app.models.usuario import Usuario

router = APIRouter()

# --- Endpoint Rutinas Principales ---

@router.post("/", response_model=RutinaResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("15/minute")
def create_rutina(
    request: Request,
    rutina: RutinaCreate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection: A user can only create a routine for themselves unless they are admin
    if rutina.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes crear rutinas para otro usuario"
            }
        )
    return crud_rutina.crear_rutina(db=db, rutina=rutina)


@router.get("/usuario/{usuario_id}", response_model=List[RutinaResponse])
@limiter.limit("30/minute")
def read_rutinas_by_usuario(
    request: Request,
    usuario_id: int,
    skip: int = 0,
    limit: int = 100,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection: A user can only read their own routines
    if usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes consultar las rutinas de otro usuario"
            }
        )
    return crud_rutina.get_rutinas_by_usuario(db, usuario_id=usuario_id, skip=skip, limit=limit)


@router.get("/{rutina_id}", response_model=RutinaResponse)
@limiter.limit("30/minute")
def read_rutina(
    request: Request,
    rutina_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_rutina = crud_rutina.get_rutina(db, rutina_id=rutina_id)
    if db_rutina is None:
        raise HTTPException(status_code=404, detail="Rutina no encontrada")
        
    # IDOR/BOLA Protection: Only owner or admin can read this routine
    if db_rutina.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes consultar esta rutina"
            }
        )
    return db_rutina


@router.put("/{rutina_id}", response_model=RutinaResponse)
@limiter.limit("20/minute")
def update_rutina(
    request: Request,
    rutina_id: int,
    rutina_in: RutinaUpdate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_rutina = crud_rutina.get_rutina(db, rutina_id=rutina_id)
    if db_rutina is None:
        raise HTTPException(status_code=404, detail="Rutina no encontrada")
        
    # IDOR/BOLA Protection: Only owner or admin can update this routine
    if db_rutina.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes modificar esta rutina"
            }
        )
    return crud_rutina.actualizar_rutina(db=db, db_rutina=db_rutina, rutina_update=rutina_in)


@router.delete("/{rutina_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("15/minute")
def delete_rutina(
    request: Request,
    rutina_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_rutina = crud_rutina.get_rutina(db, rutina_id=rutina_id)
    if db_rutina is None:
        raise HTTPException(status_code=404, detail="Rutina no encontrada")
        
    # IDOR/BOLA Protection: Only owner or admin can delete this routine
    if db_rutina.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes eliminar esta rutina"
            }
        )
    crud_rutina.eliminar_rutina(db=db, rutina_id=rutina_id)
    return None

# --- Endpoints Rutinas Registros (completadas) ---

@router.post("/{rutina_id}/registros", response_model=RegistroRutinaResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def create_registro_rutina(
    request: Request,
    rutina_id: int,
    registro: RegistroRutinaCreate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_rutina = crud_rutina.get_rutina(db, rutina_id=rutina_id)
    if db_rutina is None:
        raise HTTPException(status_code=404, detail="Rutina no encontrada")
        
    # IDOR/BOLA Protection: Only owner can mark this routine as completed
    if db_rutina.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes registrar la completitud de una rutina de otro usuario"
            }
        )
    
    return crud_rutina.registrar_rutina_completada(db=db, rutina_id=rutina_id, registro=registro)


@router.get("/{rutina_id}/registros", response_model=List[RegistroRutinaResponse])
@limiter.limit("30/minute")
def read_registros_rutina(
    request: Request,
    rutina_id: int,
    skip: int = 0,
    limit: int = 100,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_rutina = crud_rutina.get_rutina(db, rutina_id=rutina_id)
    if db_rutina is None:
        raise HTTPException(status_code=404, detail="Rutina no encontrada")
        
    # IDOR/BOLA Protection: Only owner or admin can read registers
    if db_rutina.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes consultar los registros de una rutina de otro usuario"
            }
        )
    return crud_rutina.get_registros_by_rutina(db, rutina_id=rutina_id, skip=skip, limit=limit)
