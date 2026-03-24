from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate

def get_usuario(db: Session, usuario_id: int):
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()

def get_usuario_by_email(db: Session, email: str):
    return db.query(Usuario).filter(Usuario.email == email).first()

def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Usuario).offset(skip).limit(limit).all()

def crear_usuario(db: Session, usuario: UsuarioCreate):
    # Nota de seguridad: aquí debes usar una librería como passlib para hacer hash real
    fake_hashed_password = usuario.password + "notreallyhashed"
    
    db_usuario = Usuario(
        email=usuario.email, 
        nombre=usuario.nombre,
        password_hash=fake_hashed_password,
        is_active=usuario.is_active
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario
