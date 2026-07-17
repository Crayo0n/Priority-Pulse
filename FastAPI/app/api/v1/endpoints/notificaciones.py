from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.notificacion import NotificacionCreate, NotificacionResponse, NotificacionUpdate
from app.crud import crud_notificacion
from app.core.limiter import limiter
from app.api.deps import validar_api_key, obtener_usuario_actual
from app.models.usuario import Usuario

router = APIRouter()


@router.post("/", response_model=NotificacionResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def create_notificacion(
    request: Request,
    notificacion: NotificacionCreate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection: A user can only create a notification for themselves unless they are admin
    if notificacion.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes crear notificaciones para otro usuario"
            }
        )
    return crud_notificacion.crear_notificacion(db=db, notificacion=notificacion)


@router.get("/usuario/{usuario_id}", response_model=List[NotificacionResponse])
@limiter.limit("30/minute")
def read_notificaciones_usuario(
    request: Request,
    usuario_id: int,
    skip: int = 0,
    limit: int = 100,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection: A user can only read their own notifications
    if usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes consultar las notificaciones de otro usuario"
            }
        )
    return crud_notificacion.get_notificaciones_usuario(db, usuario_id=usuario_id, skip=skip, limit=limit)


@router.put("/{notificacion_id}/leida", response_model=NotificacionResponse)
@limiter.limit("30/minute")
def mark_notificacion_leida(
    request: Request,
    notificacion_id: int,
    actualizacion: NotificacionUpdate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_notif = crud_notificacion.get_notificacion(db, notificacion_id=notificacion_id)
    if db_notif is None:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
        
    # IDOR/BOLA Protection: Only owner or admin can modify this notification
    if db_notif.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes modificar esta notificacion"
            }
        )
    
    return crud_notificacion.marcar_como_leida(db=db, db_notificacion=db_notif, notificacion_update=actualizacion)


@router.delete("/{notificacion_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
def delete_notificacion(
    request: Request,
    notificacion_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_notif = crud_notificacion.get_notificacion(db, notificacion_id=notificacion_id)
    if db_notif is None:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
        
    # IDOR/BOLA Protection: Only owner or admin can delete this notification
    if db_notif.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes eliminar esta notificacion"
            }
        )
    
    crud_notificacion.eliminar_notificacion(db=db, notificacion_id=notificacion_id)
    return None
