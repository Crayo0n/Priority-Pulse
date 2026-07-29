import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.core.config import settings

def verificar_password(password_plano: str, password_hash: str) -> bool:
    # Handle PHP/Laravel standard bcrypt hash prefix replacement if present
    if password_hash.startswith("$2y$"):
        password_hash = password_hash.replace("$2y$", "$2b$")
    
    try:
        return bcrypt.checkpw(
            password_plano.encode("utf-8"),
            password_hash.encode("utf-8")
        )
    except ValueError:
        return False

def obtener_password_hash(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

def crear_access_token(usuario_id: int, rol: str, nombre_usuario: str) -> str:
    expiracion = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    
    payload = {
        "sub": str(usuario_id),
        "nombre_usuario": nombre_usuario,
        "rol": rol,
        "exp": expiracion
    }
    
    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return token
