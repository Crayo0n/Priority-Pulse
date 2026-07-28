from sqlalchemy.orm import Session
from sqlalchemy import cast, Date
from datetime import datetime
from typing import Optional
from app.models.tarea import Tarea
from app.schemas.tarea import TareaCreate, TareaUpdate

def get_tarea(db: Session, tarea_id: int):
    return db.query(Tarea).filter(Tarea.id == tarea_id).first()

def get_tareas_by_usuario(db: Session, usuario_id: int, skip: int = 0, limit: int = 100, fecha: Optional[str] = None):
    query = db.query(Tarea).filter(Tarea.usuario_id == usuario_id)
    if fecha:
        try:
            fecha_obj = datetime.strptime(fecha, "%Y-%m-%d").date()
            query = query.filter(cast(Tarea.fecha_limite, Date) == fecha_obj)
        except ValueError:
            pass # Si el formato es invalido, ignorar el filtro
            
    return query.offset(skip).limit(limit).all()

def get_todas_las_tareas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Tarea).offset(skip).limit(limit).all()

def crear_tarea(db: Session, tarea: TareaCreate):
    db_tarea = Tarea(**tarea.model_dump())
    db.add(db_tarea)
    db.commit()
    db.refresh(db_tarea)
    return db_tarea

def actualizar_tarea(db: Session, db_tarea: Tarea, tarea_update: TareaUpdate):
    update_data = tarea_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tarea, key, value)
    db.commit()
    db.refresh(db_tarea)
    return db_tarea

def eliminar_tarea(db: Session, tarea_id: int):
    db_tarea = get_tarea(db, tarea_id)
    if db_tarea:
        db.delete(db_tarea)
        db.commit()
    return db_tarea

def actualizar_tarea_serie(db: Session, db_tarea: Tarea, tarea_update: TareaUpdate):
    if not db_tarea.grupo_id:
        return actualizar_tarea(db, db_tarea, tarea_update)
        
    update_data = tarea_update.model_dump(exclude_unset=True)
    tareas_serie = db.query(Tarea).filter(Tarea.grupo_id == db_tarea.grupo_id).all()
    
    for tarea in tareas_serie:
        for key, value in update_data.items():
            if key != 'fecha_limite':  # Do not overwrite the dates for the series tasks, they are offset. Wait, repeticion modifies date? No, just keep their original dates but update title, etc.
                setattr(tarea, key, value)
    
    db.commit()
    db.refresh(db_tarea)
    return db_tarea

def eliminar_tarea_serie(db: Session, db_tarea: Tarea):
    if not db_tarea.grupo_id:
        return eliminar_tarea(db, db_tarea.id)
        
    tareas_serie = db.query(Tarea).filter(Tarea.grupo_id == db_tarea.grupo_id).all()
    for tarea in tareas_serie:
        db.delete(tarea)
    db.commit()
    return db_tarea
