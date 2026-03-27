from pydantic import BaseModel, EmailStr
from typing import Optional


class UsuarioBase(BaseModel):
    nombre_usuario: str
    correo: EmailStr
    rol: Optional[str] = "user"
    zona_horaria: Optional[str] = "UTC"


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioResponse(UsuarioBase):
    id: int
    xp_total: int
    racha_actual: int
    nivel_id: Optional[int] = None

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
