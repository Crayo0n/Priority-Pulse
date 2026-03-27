from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate
import hashlib


def _hash_password(password: str) -> str:
    """Hash simple SHA-256. En producción usa bcrypt/passlib."""
    return hashlib.sha256(password.encode()).hexdigest()


def get_usuario(db: Session, usuario_id: int):
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()


def get_usuario_by_correo(db: Session, correo: str):
    return db.query(Usuario).filter(Usuario.correo == correo).first()


def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Usuario).offset(skip).limit(limit).all()


def crear_usuario(db: Session, usuario: UsuarioCreate):
    db_usuario = Usuario(
        nombre_usuario=usuario.nombre_usuario,
        correo=usuario.correo,
        password_hash=_hash_password(usuario.password),
        rol=usuario.rol,
        zona_horaria=usuario.zona_horaria,
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def verificar_credenciales(db: Session, correo: str, password: str):
    """Busca el usuario por correo y verifica el password. Retorna el usuario o None."""
    usuario = get_usuario_by_correo(db, correo)
    if not usuario:
        return None
    if usuario.password_hash != _hash_password(password):
        return None
    return usuario
