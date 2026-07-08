from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.tarea import TareaCreate, TareaResponse, TareaUpdate
from app.crud import crud_tarea, crud_usuario
from app.core.limiter import limiter
from app.api.deps import validar_api_key, obtener_usuario_actual, requiere_rol
from app.models.usuario import Usuario

router = APIRouter()


@router.post("/", response_model=TareaResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def create_tarea(
    request: Request,
    tarea: TareaCreate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection: A user can only create a task for themselves unless they are admin
    if tarea.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes crear tareas para otro usuario"
            }
        )
    return crud_tarea.crear_tarea(db=db, tarea=tarea)


@router.get("/", response_model=List[TareaResponse])
@limiter.limit("10/minute")
def read_tareas(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(requiere_rol("admin")),
    db: Session = Depends(get_db)
):
    # RBAC: Only admins can list all tasks in the system
    return crud_tarea.get_todas_las_tareas(db, skip=skip, limit=limit)


@router.get("/usuario/{usuario_id}", response_model=List[TareaResponse])
@limiter.limit("30/minute")
def read_tareas_by_usuario(
    request: Request,
    usuario_id: int,
    skip: int = 0,
    limit: int = 100,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection: A user can only read their own tasks list
    if usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes consultar las tareas de otro usuario"
            }
        )
    return crud_tarea.get_tareas_by_usuario(db, usuario_id=usuario_id, skip=skip, limit=limit)


@router.get("/{tarea_id}", response_model=TareaResponse)
@limiter.limit("30/minute")
def read_tarea(
    request: Request,
    tarea_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_tarea = crud_tarea.get_tarea(db, tarea_id=tarea_id)
    if db_tarea is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
        
    # IDOR/BOLA Protection: Only owner or admin can read this task
    if db_tarea.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes consultar esta tarea"
            }
        )
    return db_tarea


@router.put("/{tarea_id}", response_model=TareaResponse)
@limiter.limit("30/minute")
def update_tarea(
    request: Request,
    tarea_id: int,
    tarea_in: TareaUpdate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_tarea = crud_tarea.get_tarea(db, tarea_id=tarea_id)
    if db_tarea is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
        
    # IDOR/BOLA Protection: Only owner or admin can update this task
    if db_tarea.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes modificar esta tarea"
            }
        )
        
    updated = crud_tarea.actualizar_tarea(db=db, db_tarea=db_tarea, tarea_update=tarea_in)
    # Actualizar racha si la tarea fue marcada como completada
    if tarea_in.estado == "completada" and db_tarea.usuario_id:
        crud_usuario.actualizar_racha_tras_tarea(db, usuario_id=db_tarea.usuario_id)
    return updated


@router.delete("/{tarea_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
def delete_tarea(
    request: Request,
    tarea_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_tarea = crud_tarea.get_tarea(db, tarea_id=tarea_id)
    if db_tarea is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
        
    # IDOR/BOLA Protection: Only owner or admin can delete this task
    if db_tarea.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes eliminar esta tarea"
            }
        )
        
    crud_tarea.eliminar_tarea(db=db, tarea_id=tarea_id)
    return None
