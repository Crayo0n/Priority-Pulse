from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.amistad import AmistadCreate, AmistadResponse, AmistadUpdate
from app.crud import crud_amistad
from app.core.limiter import limiter
from app.api.deps import validar_api_key, obtener_usuario_actual
from app.models.usuario import Usuario

router = APIRouter()


@router.post("/solicitudes", response_model=AmistadResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("15/minute")
def enviar_solicitud(
    request: Request,
    solicitud: AmistadCreate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection: A user can only send requests initiated by themselves
    if solicitud.usuario_id_1 != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes enviar una solicitud de amistad en nombre de otro usuario"
            }
        )
        
    if solicitud.usuario_id_1 == solicitud.usuario_id_2:
        raise HTTPException(status_code=400, detail="No puedes enviarte solicitud a ti mismo")
        
    amistad_existente = crud_amistad.get_amistad_entre_usuarios(db, solicitud.usuario_id_1, solicitud.usuario_id_2)
    if amistad_existente:
        raise HTTPException(status_code=400, detail="Ya existe una amistad o solicitud entre estos usuarios")
        
    return crud_amistad.enviar_solicitud_amistad(db=db, solicitud=solicitud)
@router.get("/estado/{usuario_id}", status_code=status.HTTP_200_OK)
@limiter.limit("60/minute")
def consultar_estado_amistad(
    request: Request,
    usuario_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    if usuario_id == usuario_actual.id:
        return {"estado": "mismo_usuario"}
        
    amistad = crud_amistad.get_amistad_entre_usuarios(db, usuario_actual.id, usuario_id)
    if not amistad:
        return {"estado": "ninguna"}
        
    if amistad.estado == "aceptada":
        return {"estado": "aceptada", "id": amistad.id}
    elif amistad.estado == "pendiente":
        if amistad.usuario_id_1 == usuario_actual.id:
            return {"estado": "pendiente_enviada", "id": amistad.id}
        else:
            return {"estado": "pendiente_recibida", "id": amistad.id}
    
    return {"estado": amistad.estado, "id": amistad.id}


@router.get("/usuario/{usuario_id}", response_model=List[AmistadResponse])
@limiter.limit("30/minute")
def listar_amistades(
    request: Request,
    usuario_id: int,
    skip: int = 0,
    limit: int = 100,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection: A user can only list their own friendships
    if usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes consultar las amistades de otro usuario"
            }
        )
    return crud_amistad.get_amistades_por_usuario(db, usuario_id=usuario_id, skip=skip, limit=limit)


@router.put("/{amistad_id}", response_model=AmistadResponse)
@limiter.limit("20/minute")
def responder_solicitud(
    request: Request,
    amistad_id: int,
    actualizacion: AmistadUpdate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_amistad = crud_amistad.get_amistad(db, amistad_id=amistad_id)
    if db_amistad is None:
        raise HTTPException(status_code=404, detail="Solicitud de amistad no encontrada")
    
    # IDOR/BOLA Protection: Only the recipient of the request (usuario_id_2) can accept/decline it
    if db_amistad.usuario_id_2 != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes responder a esta solicitud de amistad"
            }
        )
        
    return crud_amistad.actualizar_estado_amistad(db=db, db_amistad=db_amistad, estado=actualizacion.estado)


@router.delete("/{amistad_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
def borrar_amistad(
    request: Request,
    amistad_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_amistad = crud_amistad.get_amistad(db, amistad_id=amistad_id)
    if db_amistad is None:
        raise HTTPException(status_code=404, detail="Amistad no encontrada")
        
    # IDOR/BOLA Protection: Only either of the two users can delete the friendship
    if db_amistad.usuario_id_1 != usuario_actual.id and db_amistad.usuario_id_2 != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes eliminar una amistad que no te pertenece"
            }
        )
        
    crud_amistad.eliminar_amistad(db=db, amistad_id=amistad_id)
    return None
