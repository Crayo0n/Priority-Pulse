from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from datetime import datetime, timedelta, timezone
from app.core.security import verificar_password, obtener_password_hash

def get_usuario(db: Session, usuario_id: int):
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()

def get_usuario_by_email(db: Session, correo: str):
    return db.query(Usuario).filter(Usuario.correo == correo).first()

def get_usuario_by_correo(db: Session, correo: str):
    return get_usuario_by_email(db, correo)

def get_usuario_by_username(db: Session, username: str):
    return db.query(Usuario).filter(Usuario.nombre_usuario == username).first()

def autenticar_usuario(db: Session, correo: str, password: str):
    usuario = get_usuario_by_email(db, correo=correo)
    if not usuario:
        return None
    try:
        is_valid = verificar_password(password, usuario.password_hash)
    except Exception:
        is_valid = False
            
    if is_valid:
        return usuario
    return None

def verificar_credenciales(db: Session, correo: str, password: str):
    return autenticar_usuario(db, correo=correo, password=password)

def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Usuario).offset(skip).limit(limit).all()

def get_usuarios_by_xp(db: Session, limit: int = 100):
    return db.query(Usuario).filter(Usuario.rol != 'admin').order_by(Usuario.xp_total.desc()).limit(limit).all()

def crear_usuario(db: Session, usuario: UsuarioCreate):
    from app.models.nivel import Nivel
    nivel_inicial = db.query(Nivel).filter(Nivel.numero_nivel == 1).first()
    nivel_id = nivel_inicial.id if nivel_inicial else None

    hashed_pwd = obtener_password_hash(usuario.password)
    db_usuario = Usuario(
        correo=usuario.correo, 
        nombre_usuario=usuario.nombre_usuario,
        nombre=usuario.nombre,
        foto_perfil=usuario.foto_perfil,
        password_hash=hashed_pwd,
        rol=usuario.rol or "user",
        nivel_id=nivel_id
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def update_usuario(db: Session, db_usuario: Usuario, usuario_in: UsuarioUpdate):
    update_data = usuario_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_usuario, field, value)
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def actualizar_racha_tras_tarea(db: Session, usuario_id: int):
    """Call this when a task is marked complete. Updates streak based on last completion time."""
    usuario = get_usuario(db, usuario_id)
    if not usuario:
        return
    ahora = datetime.utcnow()
    ultima = usuario.ultima_tarea_completada

    if ultima is None:
        # Primera tarea completada
        usuario.racha_actual = 1
    else:
        # Usar fechas para calcular la diferencia de días calendario (asumiendo UTC)
        ahora_fecha = ahora.date()
        ultima_fecha = ultima.date()
        
        diff_dias = (ahora_fecha - ultima_fecha).days
        
        if diff_dias > 1:
            # Pasó más de un día calendario, racha rota
            usuario.racha_actual = 1
        elif diff_dias == 1:
            # Nueva tarea en el día siguiente
            usuario.racha_actual += 1
        # Si diff_dias == 0, fue el mismo día, no se incrementa

    usuario.ultima_tarea_completada = ahora
    db.add(usuario)
    db.commit()

def verificar_y_resetear_racha(db: Session, usuario_id: int):
    """Call this on page load to reset streak to 0 if >24h passed without completing a task."""
    usuario = get_usuario(db, usuario_id)
    if not usuario or usuario.ultima_tarea_completada is None:
        return
    ahora = datetime.utcnow()
    diff_dias = (ahora.date() - usuario.ultima_tarea_completada.date()).days
    if diff_dias > 1 and usuario.racha_actual > 0:
        usuario.racha_actual = 0
        db.add(usuario)
        db.commit()

from app.models.nivel import Nivel
from app.models.historial_xp import HistorialXp

def otorgar_xp(db: Session, usuario_id: int, cantidad: int, motivo: str):
    """Otorga XP a un usuario, evalúa si sube de nivel y registra el historial."""
    if cantidad <= 0:
        return
    
    usuario = get_usuario(db, usuario_id)
    if not usuario:
        return
        
    # Añadir al historial
    historial = HistorialXp(
        usuario_id=usuario_id,
        cantidad_xp=cantidad,
        motivo=motivo
    )
    db.add(historial)
    
    # Sumar XP
    usuario.xp_total += cantidad
    
    # Calcular nivel
    # Asume que Nivel.numero_nivel está ordenado de menor a mayor
    # Buscamos el nivel más alto cuya xp_requerida sea <= xp_total
    nivel_correspondiente = db.query(Nivel).filter(
        Nivel.xp_requerida <= usuario.xp_total
    ).order_by(Nivel.xp_requerida.desc()).first()
    
    if nivel_correspondiente and (usuario.nivel_id != nivel_correspondiente.id):
        usuario.nivel_id = nivel_correspondiente.id
        # TODO: Se podría crear una notificación aquí de "¡Subiste de nivel!"
        
    db.add(usuario)
    db.commit()

