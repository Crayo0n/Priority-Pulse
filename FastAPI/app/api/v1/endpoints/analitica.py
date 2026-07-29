from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import date

from app.db.database import get_db
from app.models.usuario import Usuario
from app.models.tarea import Tarea
from app.models.medalla import Medalla, UsuarioMedalla
from app.models.nivel import Nivel
from app.schemas.analitica import DashboardStats, NivelFunnel
from app.core.limiter import limiter
from app.api.deps import validar_api_key, requiere_rol

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats, summary="KPIs globales para el Panel Admin")
@limiter.limit("10/minute")
def get_dashboard_stats(
    request: Request,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(requiere_rol("admin")),
    db: Session = Depends(get_db)
):

    # --- KPIs de Usuarios (solo jugadores regulares) ---
    total_usuarios: int = db.query(func.count(Usuario.id)).filter(Usuario.rol != 'admin').scalar() or 0

    racha_promedio_raw = db.query(func.avg(Usuario.racha_actual)).filter(Usuario.rol != 'admin').scalar()
    racha_promedio: float = round(float(racha_promedio_raw), 1) if racha_promedio_raw else 0.0

    xp_total_generada: int = db.query(func.sum(Usuario.xp_total)).filter(Usuario.rol != 'admin').scalar() or 0

    # --- KPIs de Tareas ---
    total_tareas: int = db.query(func.count(Tarea.id)).scalar() or 0

    hoy = date.today()
    tareas_creadas_hoy: int = (
        db.query(func.count(Tarea.id))
        .filter(cast(Tarea.fecha_limite, Date) == hoy)
        .scalar()
        or 0
    )

    # --- KPIs de Medallas ---
    medallas_desbloqueadas: int = db.query(func.count(UsuarioMedalla.id)).scalar() or 0
    total_medallas_catalogo: int = db.query(func.count(Medalla.id)).scalar() or 0

    # --- Funnel de Retención por Niveles ---
    rangos = [
        ("Nivel 1-10",  1,  10),
        ("Nivel 11-20", 11, 20),
        ("Nivel 21-30", 21, 30),
        ("Nivel 31-40", 31, 40),
        ("Elite (40+)", 41, 9999),
    ]

    funnel: list[NivelFunnel] = []
    for rango, min_nivel, max_nivel in rangos:
        if min_nivel == 1:
            count = (
                db.query(func.count(Usuario.id))
                .outerjoin(Nivel, Usuario.nivel_id == Nivel.id)
                .filter(
                    Usuario.rol != 'admin',
                    (Usuario.nivel_id.is_(None)) | 
                    ((Nivel.numero_nivel >= min_nivel) & (Nivel.numero_nivel <= max_nivel))
                )
                .scalar()
                or 0
            )
        else:
            count = (
                db.query(func.count(Usuario.id))
                .join(Nivel, Usuario.nivel_id == Nivel.id)
                .filter(
                    Usuario.rol != 'admin',
                    Nivel.numero_nivel >= min_nivel,
                    Nivel.numero_nivel <= max_nivel,
                )
                .scalar()
                or 0
            )
        pct = round((count / total_usuarios * 100), 1) if total_usuarios > 0 else 0.0
        funnel.append(NivelFunnel(rango=rango, total_usuarios=count, porcentaje=pct))

    return DashboardStats(
        total_usuarios=total_usuarios,
        tareas_creadas_hoy=tareas_creadas_hoy,
        total_tareas=total_tareas,
        medallas_desbloqueadas=medallas_desbloqueadas,
        racha_promedio=racha_promedio,
        xp_total_generada=xp_total_generada,
        niveles_funnel=funnel,
        total_medallas_catalogo=total_medallas_catalogo,
    )
