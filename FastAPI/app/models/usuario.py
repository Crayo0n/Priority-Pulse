from sqlalchemy import Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from datetime import datetime
from app.models.base import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nivel_id: Mapped[Optional[int]] = mapped_column(ForeignKey("niveles.id"), nullable=True)
    nombre: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    nombre_usuario: Mapped[str] = mapped_column(String, index=True)
    correo: Mapped[str] = mapped_column(String, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String)
    foto_perfil: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    rol: Mapped[str] = mapped_column(String, default="user")
    xp_total: Mapped[int] = mapped_column(Integer, default=0)
    racha_actual: Mapped[int] = mapped_column(Integer, default=0)
    ultima_tarea_completada: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    zona_horaria: Mapped[str] = mapped_column(String, default="UTC")

    nivel: Mapped[Optional["Nivel"]] = relationship("Nivel", back_populates="usuarios")
    tareas: Mapped[List["Tarea"]] = relationship("Tarea", back_populates="usuario", cascade="all, delete-orphan")
    rutinas: Mapped[List["Rutina"]] = relationship("Rutina", back_populates="usuario", cascade="all, delete-orphan")
    usuario_medallas: Mapped[List["UsuarioMedalla"]] = relationship("UsuarioMedalla", back_populates="usuario", cascade="all, delete-orphan")
    notificaciones: Mapped[List["Notificacion"]] = relationship("Notificacion", back_populates="usuario", cascade="all, delete-orphan")
    historial_xp: Mapped[List["HistorialXp"]] = relationship("HistorialXp", back_populates="usuario", cascade="all, delete-orphan")
    
    # Amistades
    amistades_enviadas: Mapped[List["Amistad"]] = relationship(
        "Amistad", foreign_keys="[Amistad.usuario_id_1]", back_populates="usuario_1", cascade="all, delete-orphan"
    )
    amistades_recibidas: Mapped[List["Amistad"]] = relationship(
        "Amistad", foreign_keys="[Amistad.usuario_id_2]", back_populates="usuario_2", cascade="all, delete-orphan"
    )

    @property
    def nivel_actual(self):
        return self.nivel

    @property
    def nivel_siguiente(self):
        from sqlalchemy.orm import object_session
        from app.models.nivel import Nivel
        session = object_session(self)
        if not session or not self.nivel:
            return None
        return session.query(Nivel).filter(Nivel.numero_nivel > self.nivel.numero_nivel).order_by(Nivel.numero_nivel.asc()).first()

    @property
    def progreso_pct(self):
        if not self.nivel:
            return 0.0
        siguiente = self.nivel_siguiente
        if not siguiente:
            return 100.0
        
        rango = siguiente.xp_requerida - self.nivel.xp_requerida
        xp_en_rango = self.xp_total - self.nivel.xp_requerida
        if rango <= 0:
            return 100.0
        return min(round((xp_en_rango / rango) * 100, 1), 100.0)
