from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TareaBase(BaseModel):
    titulo: str = Field(..., max_length=50)
    descripcion: Optional[str] = None
    estado: Optional[str] = "pendiente"
    fecha_limite: Optional[datetime] = None
    es_critica: Optional[bool] = False
    xp_recompensa: Optional[int] = 0
    tags: Optional[str] = None
    emoji: Optional[str] = None
    repeticion: Optional[str] = None
    tiempo_inicio: Optional[str] = None
    tiempo_fin: Optional[str] = None
    recordatorio_hora: Optional[str] = None
    grupo_id: Optional[str] = None
    rutina_id: Optional[int] = None

class TareaCreate(TareaBase):
    usuario_id: int

class TareaUpdate(BaseModel):
    titulo: Optional[str] = Field(None, max_length=50)
    descripcion: Optional[str] = None
    estado: Optional[str] = None
    fecha_limite: Optional[datetime] = None
    es_critica: Optional[bool] = None
    xp_recompensa: Optional[int] = None
    tags: Optional[str] = None
    emoji: Optional[str] = None
    repeticion: Optional[str] = None
    tiempo_inicio: Optional[str] = None
    tiempo_fin: Optional[str] = None
    recordatorio_hora: Optional[str] = None
    grupo_id: Optional[str] = None
    rutina_id: Optional[int] = None

class TareaResponse(TareaBase):
    id: int
    usuario_id: Optional[int]

    class Config:
        from_attributes = True
