from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, LoginRequest, LoginResponse
from app.crud import crud_usuario

router = APIRouter()


@router.post("/login", response_model=LoginResponse, summary="Autenticación de administrador")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    usuario = crud_usuario.verificar_credenciales(db, correo=payload.correo, password=payload.password)
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    if usuario.rol != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado: se requiere rol de administrador")
    return LoginResponse(
        id=usuario.id,
        nombre_usuario=usuario.nombre_usuario,
        correo=usuario.correo,
        rol=usuario.rol,
        xp_total=usuario.xp_total,
    )


@router.post("/", response_model=UsuarioResponse)
def create_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    db_usuario = crud_usuario.get_usuario_by_correo(db, correo=usuario.correo)
    if db_usuario:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    return crud_usuario.crear_usuario(db=db, usuario=usuario)


@router.get("/", response_model=List[UsuarioResponse])
def read_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_usuario.get_usuarios(db, skip=skip, limit=limit)


@router.get("/{usuario_id}", response_model=UsuarioResponse)
def read_usuario(usuario_id: int, db: Session = Depends(get_db)):
    db_usuario = crud_usuario.get_usuario(db, usuario_id=usuario_id)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_usuario
