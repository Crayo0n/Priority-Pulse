from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
from app.crud import crud_usuario

router = APIRouter()

@router.post("/", response_model=UsuarioResponse)
def create_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    db_usuario = crud_usuario.get_usuario_by_email(db, email=usuario.email)
    if db_usuario:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    return crud_usuario.crear_usuario(db=db, usuario=usuario)

@router.get("/", response_model=List[UsuarioResponse])
def read_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    usuarios = crud_usuario.get_usuarios(db, skip=skip, limit=limit)
    return usuarios

@router.get("/{usuario_id}", response_model=UsuarioResponse)
def read_usuario(usuario_id: int, db: Session = Depends(get_db)):
    db_usuario = crud_usuario.get_usuario(db, usuario_id=usuario_id)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_usuario
