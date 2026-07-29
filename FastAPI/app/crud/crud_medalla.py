from sqlalchemy.orm import Session
from app.models.medalla import Medalla, UsuarioMedalla
from app.schemas.medalla import MedallaCreate, MedallaUpdate, UsuarioMedallaCreate

# ---- MEDALLA CRUD ----
def get_medalla(db: Session, medalla_id: int):
    return db.query(Medalla).filter(Medalla.id == medalla_id).first()

def get_medallas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Medalla).offset(skip).limit(limit).all()

def crear_medalla(db: Session, medalla: MedallaCreate):
    db_medalla = Medalla(**medalla.model_dump())
    db.add(db_medalla)
    db.commit()
    db.refresh(db_medalla)
    return db_medalla

def actualizar_medalla(db: Session, db_medalla: Medalla, medalla_update: MedallaUpdate):
    update_data = medalla_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_medalla, key, value)
    db.commit()
    db.refresh(db_medalla)
    return db_medalla

def eliminar_medalla(db: Session, medalla_id: int):
    db_medalla = get_medalla(db, medalla_id)
    if db_medalla:
        db.delete(db_medalla)
        db.commit()
    return db_medalla

# ---- USUARIO_MEDALLA CRUD (Otorgar) ----
def otorgar_medalla(db: Session, usuario_medalla: UsuarioMedallaCreate):
    db_usuario_medalla = UsuarioMedalla(**usuario_medalla.model_dump())
    db.add(db_usuario_medalla)
    db.commit()
    db.refresh(db_usuario_medalla)
    return db_usuario_medalla

def get_medallas_by_usuario(db: Session, usuario_id: int, skip: int = 0, limit: int = 100):
    return db.query(UsuarioMedalla).filter(UsuarioMedalla.usuario_id == usuario_id).offset(skip).limit(limit).all()

# ---- MOTOR DE EVALUACIÓN AUTOMÁTICA DE MEDALLAS ----
from sqlalchemy import func, cast, Date
from datetime import date, datetime
from app.models.usuario import Usuario
from app.models.tarea import Tarea
from app.models.notificacion import Notificacion

def evaluar_y_otorgar_medallas(db: Session, usuario_id: int):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        return []

    # Medallas ya obtenidas
    obtenidas_ids = set(
        row[0] for row in db.query(UsuarioMedalla.medalla_id).filter(UsuarioMedalla.usuario_id == usuario_id).all()
    )

    todas_medallas = db.query(Medalla).all()
    if not todas_medallas:
        return []

    hoy = date.today()
    tareas_hoy_count = (
        db.query(func.count(Tarea.id))
        .filter(Tarea.usuario_id == usuario_id, Tarea.estado == "completada", cast(Tarea.fecha_limite, Date) == hoy)
        .scalar() or 0
    )
    tareas_totales_count = (
        db.query(func.count(Tarea.id))
        .filter(Tarea.usuario_id == usuario_id, Tarea.estado == "completada")
        .scalar() or 0
    )

    numero_nivel = usuario.nivel.numero_nivel if (hasattr(usuario, 'nivel') and usuario.nivel) else 1

    nuevas = []
    for m in todas_medallas:
        if m.id in obtenidas_ids:
            continue

        cumple = False
        trigger = (m.tipo_trigger or "acciones").lower()
        val_req = m.valor_requerido or 1

        if trigger == "racha_dias":
            cumple = (usuario.racha_actual >= val_req)
        elif trigger == "tareas_dia":
            cumple = (tareas_hoy_count >= val_req)
        elif trigger == "tareas_totales":
            cumple = (tareas_totales_count >= val_req)
        elif trigger == "nivel_alcanzado":
            cumple = (numero_nivel >= val_req)
        elif trigger in ["logro_especial", "acciones"]:
            cumple = (tareas_totales_count >= val_req)

        if cumple:
            nueva_um = UsuarioMedalla(
                usuario_id=usuario_id,
                medalla_id=m.id,
                fecha_obtencion=datetime.utcnow()
            )
            db.add(nueva_um)

            noti = Notificacion(
                usuario_id=usuario_id,
                titulo="🏆 Medalla Desbloqueada",
                mensaje=f"¡Felicidades! Has desbloqueado la medalla: {m.nombre}"
            )
            db.add(noti)
            nuevas.append(m)

    if nuevas:
        db.commit()

    return nuevas

def evaluar_y_otorgar_medallas_todos(db: Session):
    usuarios = db.query(Usuario).filter(Usuario.rol != "admin").all()
    total_otorgadas = 0
    for u in usuarios:
        nuevas = evaluar_y_otorgar_medallas(db, u.id)
        total_otorgadas += len(nuevas)
    return total_otorgadas
