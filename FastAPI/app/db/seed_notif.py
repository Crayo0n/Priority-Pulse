from app.db.database import sesionLocal
from app.models.usuario import Usuario
from app.models.notificacion import Notificacion
from datetime import datetime, timedelta

def seed_notificaciones():
    db = sesionLocal()
    try:
        # Seed for a few test users to ensure they exist for demonstration
        users = db.query(Usuario).limit(5).all()
        if not users:
            print("No users found to seed notifications for.")
            return

        now = datetime.utcnow()
        
        # We will create 3 notifications per user
        for u in users:
            notifs = [
                Notificacion(
                    usuario_id=u.id,
                    titulo="¡Racha en peligro!",
                    mensaje="No has registrado ninguna tarea hoy. ¡Mantén tu racha ahora!",
                    leida=False,
                    fecha_creacion=now - timedelta(minutes=45)
                ),
                Notificacion(
                    usuario_id=u.id,
                    titulo="¡Nuevo logro desbloqueado!",
                    mensaje="Has alcanzado el Nivel 2 en productividad.",
                    leida=False,
                    fecha_creacion=now - timedelta(hours=3)
                ),
                Notificacion(
                    usuario_id=u.id,
                    titulo="Actualización del Sistema",
                    mensaje="¡Bienvenido a Priority Pulse MVP! Explora tus nuevas opciones de rutina.",
                    leida=True,
                    fecha_creacion=now - timedelta(days=1)
                )
            ]
            
            # Avoid inserting if the user already has notifications so we don't spam 
            # upon rerunning the script
            existing_count = db.query(Notificacion).filter(Notificacion.usuario_id == u.id).count()
            if existing_count < 3:
                db.add_all(notifs)
                print(f"Added 3 test notifications for user {u.correo}")
            else:
                print(f"User {u.correo} already has {existing_count} notifications.")
                
        db.commit()
        print("Notification seeding completed.")

    except Exception as e:
        print(f"Error seeding notifications: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_notificaciones()
