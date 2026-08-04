from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.tarea import TareaCreate, TareaResponse, TareaUpdate
from app.crud import crud_tarea, crud_usuario, crud_medalla
from app.core.limiter import limiter
from app.api.deps import validar_api_key, obtener_usuario_actual, requiere_rol
from app.models.usuario import Usuario
import uuid
from datetime import timedelta

router = APIRouter()


@router.post("/", response_model=TareaResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def create_tarea(
    request: Request,
    tarea: TareaCreate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection: A user can only create a task for themselves unless they are admin
    if tarea.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes crear tareas para otro usuario"
            }
        )
    
    # Manejo de repetición de tareas
    if tarea.repeticion and tarea.repeticion != "no_repetir":
        tarea.grupo_id = str(uuid.uuid4())
        fecha_base = tarea.fecha_limite if tarea.fecha_limite else datetime.utcnow()
        tareas_creadas = []
        
        # Generar primera tarea
        primera_tarea = crud_tarea.crear_tarea(db=db, tarea=tarea)
        tareas_creadas.append(primera_tarea)
        
        # Generar siguientes copias (limitado a corto plazo para no saturar DB)
        dias_a_sumar = []
        if tarea.repeticion == "diario":
            dias_a_sumar = [i for i in range(1, 30)] # Proximos 30 dias
        elif tarea.repeticion == "semanal":
            dias_a_sumar = [i * 7 for i in range(1, 5)] # Proximas 4 semanas
        elif tarea.repeticion == "mensual":
            dias_a_sumar = [i * 30 for i in range(1, 4)] # Proximos 3 meses (aprox)
        elif tarea.repeticion == "fin_semana":
            # Agregar sabados y domingos de las proximas 4 semanas
            for i in range(1, 30):
                d = fecha_base + timedelta(days=i)
                if d.weekday() >= 5: # 5=Sabado, 6=Domingo
                    dias_a_sumar.append(i)
        
        for dias in dias_a_sumar:
            nueva_fecha = fecha_base + timedelta(days=dias)
            tarea_copia = tarea.model_copy()
            tarea_copia.fecha_limite = nueva_fecha
            crud_tarea.crear_tarea(db=db, tarea=tarea_copia)
            
        return primera_tarea
    else:
        return crud_tarea.crear_tarea(db=db, tarea=tarea)


@router.get("/", response_model=List[TareaResponse])
@limiter.limit("10/minute")
def read_tareas(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(requiere_rol("admin")),
    db: Session = Depends(get_db)
):
    # RBAC: Only admins can list all tasks in the system
    return crud_tarea.get_todas_las_tareas(db, skip=skip, limit=limit)


@router.get("/usuario/{usuario_id}", response_model=List[TareaResponse])
@limiter.limit("30/minute")
def read_tareas_by_usuario(
    request: Request,
    usuario_id: int,
    fecha: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection: A user can only read their own tasks list
    if usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes consultar las tareas de otro usuario"
            }
        )
    return crud_tarea.get_tareas_by_usuario(db, usuario_id=usuario_id, skip=skip, limit=limit, fecha=fecha)


@router.get("/{tarea_id}", response_model=TareaResponse)
@limiter.limit("30/minute")
def read_tarea(
    request: Request,
    tarea_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_tarea = crud_tarea.get_tarea(db, tarea_id=tarea_id)
    if db_tarea is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
        
    # IDOR/BOLA Protection: Only owner or admin can read this task
    if db_tarea.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes consultar esta tarea"
            }
        )
    return db_tarea


@router.put("/{tarea_id}", response_model=TareaResponse)
@limiter.limit("30/minute")
def update_tarea(
    request: Request,
    tarea_id: int,
    tarea_in: TareaUpdate,
    apply_to_series: bool = False,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_tarea = crud_tarea.get_tarea(db, tarea_id=tarea_id)
    if db_tarea is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
        
    # IDOR/BOLA Protection: Only owner or admin can update this task
    if db_tarea.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes modificar esta tarea"
            }
        )
        
    was_completed = db_tarea.estado == "completada"
    xp_ya_otorgada = getattr(db_tarea, 'xp_otorgada', False)
    
    if apply_to_series and db_tarea.grupo_id:
        updated = crud_tarea.actualizar_tarea_serie(db=db, db_tarea=db_tarea, tarea_update=tarea_in)
    else:
        updated = crud_tarea.actualizar_tarea(db=db, db_tarea=db_tarea, tarea_update=tarea_in)
    
    # Actualizar racha y otorgar XP si la tarea se acaba de marcar como completada
    if tarea_in.estado == "completada" and not was_completed and updated.usuario_id:
        if not xp_ya_otorgada:
            crud_usuario.actualizar_racha_tras_tarea(db, usuario_id=updated.usuario_id)
            
            xp = updated.xp_recompensa if updated.xp_recompensa else 10
            crud_usuario.otorgar_xp(
                db, 
                usuario_id=updated.usuario_id, 
                cantidad=xp, 
                motivo=f"Tarea completada: {updated.titulo}"
            )
            
            # Marcar que la XP ya fue otorgada para evitar farmeo
            updated.xp_otorgada = True
            db.commit()
            db.refresh(updated)
            
            # Evaluar y otorgar medallas después de actualizar la XP y racha
            crud_medalla.evaluar_y_otorgar_medallas(db, usuario_id=updated.usuario_id)
        
    return updated


@router.delete("/{tarea_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
def delete_tarea(
    request: Request,
    tarea_id: int,
    apply_to_series: bool = False,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_tarea = crud_tarea.get_tarea(db, tarea_id=tarea_id)
    if db_tarea is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
        
    # IDOR/BOLA Protection: Only owner or admin can delete this task
    if db_tarea.usuario_id != usuario_actual.id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes eliminar esta tarea"
            }
        )
        
    if apply_to_series and db_tarea.grupo_id:
        crud_tarea.eliminar_tarea_serie(db=db, db_tarea=db_tarea)
    else:
        crud_tarea.eliminar_tarea(db=db, tarea_id=tarea_id)
        
    return None
