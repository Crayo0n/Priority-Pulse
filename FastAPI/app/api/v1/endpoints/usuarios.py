from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioUpdate, LoginRequest, LoginResponse
from app.crud import crud_usuario
from app.core.limiter import limiter
from app.core.security import crear_access_token
from app.api.deps import validar_api_key, obtener_usuario_actual, requiere_rol
from app.models.usuario import Usuario

router = APIRouter()


@router.post("/login", response_model=LoginResponse, summary="Autenticación de usuario")
@limiter.limit("5/minute")
def login(
    request: Request,
    payload: LoginRequest,
    api_key_valida: bool = Depends(validar_api_key),
    db: Session = Depends(get_db)
):
    usuario = crud_usuario.autenticar_usuario(db, correo=payload.correo, password=payload.password)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    
    token = crear_access_token(
        usuario_id=usuario.id,
        rol=usuario.rol,
        nombre_usuario=usuario.nombre_usuario
    )
    
    return LoginResponse(
        id=usuario.id,
        nombre_usuario=usuario.nombre_usuario,
        correo=usuario.correo,
        rol=usuario.rol,
        xp_total=usuario.xp_total,
        access_token=token,
        token_type="bearer"
    )


@router.post("/", response_model=UsuarioResponse)
@limiter.limit("5/minute")
def create_usuario(
    request: Request,
    usuario: UsuarioCreate,
    api_key_valida: bool = Depends(validar_api_key),
    db: Session = Depends(get_db)
):
    db_usuario = crud_usuario.get_usuario_by_email(db, correo=usuario.correo)
    if db_usuario:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    return crud_usuario.crear_usuario(db=db, usuario=usuario)


@router.get("/", response_model=List[UsuarioResponse])
@limiter.limit("20/minute")
def read_usuarios(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(requiere_rol("admin")),
    db: Session = Depends(get_db)
):
    return crud_usuario.get_usuarios(db, skip=skip, limit=limit)


@router.get("/leaderboard", response_model=List[UsuarioResponse])
@limiter.limit("30/minute")
def get_leaderboard(
    request: Request,
    limit: int = 10,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    return crud_usuario.get_usuarios_by_xp(db, limit=limit)


@router.get("/{usuario_id}", response_model=UsuarioResponse)
@limiter.limit("30/minute")
def read_usuario(
    request: Request,
    usuario_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection
    if usuario_actual.id != usuario_id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes consultar datos de otro usuario"
            }
        )
        
    db_usuario = crud_usuario.get_usuario(db, usuario_id=usuario_id)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_usuario


@router.put("/{usuario_id}", response_model=UsuarioResponse)
@limiter.limit("20/minute")
def update_usuario(
    request: Request,
    usuario_id: int,
    usuario_in: UsuarioUpdate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection
    if usuario_actual.id != usuario_id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes modificar datos de otro usuario"
            }
        )
        
    db_usuario = crud_usuario.get_usuario(db, usuario_id=usuario_id)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return crud_usuario.update_usuario(db=db, db_usuario=db_usuario, usuario_in=usuario_in)


@router.post("/{usuario_id}/check-streak", response_model=UsuarioResponse)
@limiter.limit("30/minute")
def check_streak(
    request: Request,
    usuario_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection
    if usuario_actual.id != usuario_id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes realizar esta accion en la cuenta de otro usuario"
            }
        )
        
    db_usuario = crud_usuario.get_usuario(db, usuario_id=usuario_id)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    crud_usuario.verificar_y_resetear_racha(db, usuario_id=usuario_id)
    return crud_usuario.get_usuario(db, usuario_id=usuario_id)
