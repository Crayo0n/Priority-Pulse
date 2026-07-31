from pydantic import BaseModel, EmailStr
from typing import Optional
from app.schemas.nivel import NivelResponse


class UsuarioBase(BaseModel):
    nombre: Optional[str] = None
    nombre_usuario: str
    correo: EmailStr
    foto_perfil: Optional[str] = None
    rol: Optional[str] = "user"
    zona_horaria: Optional[str] = "UTC"


class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    nombre_usuario: Optional[str] = None
    correo: Optional[EmailStr] = None
    foto_perfil: Optional[str] = None

class UsuarioLogin(BaseModel):
    correo: EmailStr
    password: str

class UsuarioPasswordUpdate(BaseModel):
    password_actual: str
    nueva_password: str

# Propiedades al devolver usuario (output)
class UsuarioResponse(UsuarioBase):
    id: int
    xp_total: int = 0
    racha_actual: int = 0
    rol: str = "user"
    nivel_actual: Optional[NivelResponse] = None
    nivel_siguiente: Optional[NivelResponse] = None
    progreso_pct: float = 0.0

    class Config:
        from_attributes = True


# Schema de entrada para el login
class LoginRequest(BaseModel):
    correo: EmailStr
    password: str


# Schema de respuesta del login (solo lo que Laravel necesita en sesión)
class LoginResponse(BaseModel):
    id: int
    nombre_usuario: str
    correo: str
    rol: str
    xp_total: int
    foto_perfil: Optional[str] = None
    access_token: str
    token_type: str = "bearer"
    nivel_actual: Optional[NivelResponse] = None
    nivel_siguiente: Optional[NivelResponse] = None
    progreso_pct: float = 0.0

class GoogleLoginRequest(BaseModel):
    id_token: str

class GoogleRegisterRequest(BaseModel):
    id_token: str
    nombre_usuario: str

