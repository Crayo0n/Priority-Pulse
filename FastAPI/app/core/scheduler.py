import logging
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from app.db.database import sesionLocal
from app.models.usuario import Usuario
from app.crud.crud_notificacion import crear_notificacion
from app.schemas.notificacion import NotificacionCreate

logger = logging.getLogger(__name__)

# Creamos el programador global
scheduler = BackgroundScheduler()

def check_streaks_in_danger():
    logger.info("Iniciando revisión automática de rachas...")
    db = sesionLocal()
    try:
        now = datetime.utcnow()
        today = now.date()
        
        usuarios_activos = db.query(Usuario).filter(Usuario.racha_actual > 0).all()
        notificados = 0
        
        for u in usuarios_activos:
            if not u.ultima_tarea_completada or u.ultima_tarea_completada.date() < today:
                notif = NotificacionCreate(
                    usuario_id=u.id,
                    titulo="¡Racha en peligro!",
                    mensaje="No has registrado ninguna tarea hoy. ¡Mantén tu racha antes de medianoche!"
                )
                crear_notificacion(db, notif)
                notificados += 1
                
        db.commit()
        logger.info(f"Revisión de rachas completa. {notificados} notificaciones enviadas.")
    except Exception as e:
        logger.error(f"Error revisando rachas: {e}")
        db.rollback()
    finally:
        db.close()


# LÓGICA FINAL Y PRODUCCIÓN: Se comentará la de prueba arriba y se usará esta
scheduler.add_job(check_streaks_in_danger, 'cron', hour=0, id='streak_daily_job', replace_existing=True)

def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        logger.info("Scheduler de FastAPI iniciado correctamente.")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler de FastAPI detenido.")
