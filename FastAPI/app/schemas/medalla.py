from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- UsuarioMedalla Schemas ---
class UsuarioMedallaBase(BaseModel):
    usuario_id: int
    medalla_id: int

class UsuarioMedallaCreate(UsuarioMedallaBase):
    pass

class UsuarioMedallaResponse(UsuarioMedallaBase):
    id: int
    fecha_obtencion: datetime

    class Config:
        from_attributes = True

# --- Medalla Schemas ---
class MedallaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = "Medalla del sistema"
    url_icono: Optional[str] = "workspace_premium"
    tipo_trigger: Optional[str] = "acciones"
    valor_requerido: Optional[int] = 1

class MedallaCreate(MedallaBase):
    pass

class MedallaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    url_icono: Optional[str] = None
    tipo_trigger: Optional[str] = None
    valor_requerido: Optional[int] = None

class MedallaResponse(MedallaBase):
    id: int

    class Config:
        from_attributes = True

# --- Schema extendido opcional ---
class MedallaConUsuariosResponse(MedallaResponse):
    usuario_medallas: List[UsuarioMedallaResponse] = []
