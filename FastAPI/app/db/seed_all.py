import random
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy.orm import Session

from app.db.database import sesionLocal, engine
from app.models.base import Base
from app.models.usuario import Usuario
from app.models.nivel import Nivel
from app.models.medalla import Medalla
from app.models.rutina import Rutina
from app.models.tarea import Tarea
from app.models.historial_xp import HistorialXp
from app.models.notificacion import Notificacion

fake = Faker('es_MX')

def seed_database():
    db: Session = sesionLocal()
    
    print("Eliminando registros y tablas anteriores...")
    Base.metadata.drop_all(bind=engine)

    print("Recreando tablas desde cero...")
    Base.metadata.create_all(bind=engine)

    print("Iniciando el poblado de la base de datos...")

    try:
        # --- 1. POBLAR NIVELES ---
        niveles_data = [
            {"numero_nivel": 1, "nombre": "Iniciado", "xp_requerida": 0, "color_hex": "#A0A0A0"},
            {"numero_nivel": 2, "nombre": "Constante", "xp_requerida": 500, "color_hex": "#4CAF50"},
            {"numero_nivel": 3, "nombre": "Disciplina Pura", "xp_requerida": 1500, "color_hex": "#2196F3"},
            {"numero_nivel": 4, "nombre": "Maestro Productivo", "xp_requerida": 3000, "color_hex": "#FFC107"}
        ]
        niveles_db = []
        for n in niveles_data:
            nivel = Nivel(
                numero_nivel=n["numero_nivel"], 
                nombre=n["nombre"], 
                xp_requerida=n["xp_requerida"],
                color_hex=n["color_hex"]
            )
            db.add(nivel)
            niveles_db.append(nivel)
        db.commit()
        print("✅ Niveles creados.")

        # --- 2. POBLAR MEDALLAS ---
        medallas_data = [
            {
                "nombre": "Primer Paso", 
                "descripcion": "Completaste tu primera tarea.", 
                "url_icono": "primer_paso.png", 
                "tipo_trigger": "tareas_completadas", 
                "valor_requerido": 1
            },
            {
                "nombre": "Racha Imparable", 
                "descripcion": "7 días seguidos cumpliendo rutinas.", 
                "url_icono": "racha.png", 
                "tipo_trigger": "racha_dias", 
                "valor_requerido": 7
            },
            {
                "nombre": "Madrugador", 
                "descripcion": "Completaste una tarea antes de las 8 AM.", 
                "url_icono": "madrugador.png", 
                "tipo_trigger": "tarea_temprano", 
                "valor_requerido": 1
            }
        ]
        for m in medallas_data:
            medalla = Medalla(
                nombre=m["nombre"], 
                descripcion=m["descripcion"], 
                url_icono=m["url_icono"],
                tipo_trigger=m["tipo_trigger"],
                valor_requerido=m["valor_requerido"]
            )
            db.add(medalla)
        db.commit()
        print("✅ Medallas creadas.")

        # --- 3. POBLAR USUARIOS ---
        # Usuario Administrador (Para que entres desde Laravel)
        admin = Usuario(
            nombre_usuario="Admin",
            correo="admin@prioritypulse.com",
            password_hash="admin123" + "notreallyhashed", 
            rol="admin",
            xp_total=3500,
            nivel_id=niveles_db[3].id # <-- Extrae el ID real del 4to nivel (Maestro Productivo)
        )
        db.add(admin)

        # Tu usuario de pruebas principal para la demo
        mauricio = Usuario(
            nombre_usuario="Mauricio",
            correo="mauricio@test.com",
            password_hash="mauri123" + "notreallyhashed",
            rol="user",
            xp_total=1200,
            nivel_id=niveles_db[1].id # <-- Extrae el ID real del 2do nivel (Constante)
        )
        db.add(mauricio)

        # Usuarios aleatorios con Faker
        usuarios_db = [admin, mauricio]
        for _ in range(10):
            user = Usuario(
                nombre_usuario=fake.user_name(),
                correo=fake.email(),
                password_hash="123456" + "notreallyhashed",
                rol="user",
                xp_total=random.randint(0, 2000),
                nivel_id=random.choice(niveles_db).id # <-- Elige un ID al azar de los niveles reales
            )
            db.add(user)
            usuarios_db.append(user)
        db.commit()
        print("✅ Usuarios creados.")

        # --- 4. POBLAR RUTINAS Y TAREAS (Enfocado a ti) ---
        rutina_manana = Rutina(nombre="Mañana Productiva", descripcion="Empezar el día al 100", usuario_id=mauricio.id)
        db.add(rutina_manana)
        db.commit()

        tareas_mauri = [
            {"titulo": "Ir al gimnasio", "descripcion": "Entrenamiento de fuerza", "estado": "completada", "xp_recompensa": 50},
            {"titulo": "Registrar agua y comidas", "descripcion": "Control de macros en la app", "estado": "completada", "xp_recompensa": 20},
            {"titulo": "Avanzar proyecto de ingeniería", "descripcion": "Programar vistas en Laravel", "estado": "pendiente", "xp_recompensa": 100}
        ]
        for t in tareas_mauri:
            tarea = Tarea(
                titulo=t["titulo"], 
                descripcion=t["descripcion"], 
                estado=t["estado"], # <-- CORREGIDO: Usamos el campo String 'estado'
                xp_recompensa=t["xp_recompensa"], # <-- Añadimos la recompensa de XP
                rutina_id=rutina_manana.id, 
                usuario_id=mauricio.id
            )
            db.add(tarea)
        db.commit()
        print("✅ Rutinas y tareas creadas.")

       # --- 5. POBLAR HISTORIAL XP Y NOTIFICACIONES (Para el Dashboard de Laravel) ---
        hoy = datetime.now()
        for i in range(30):
            # Generamos XP aleatoria para los últimos 30 días para ver gráficas bonitas
            fecha_pasada = hoy - timedelta(days=i)
            
            # 👇 Revisa muy bien estas 4 líneas de aquí 👇
            historial = HistorialXp( 
                usuario_id=mauricio.id,
                cantidad_xp=random.randint(10, 100), # <-- ¡Tiene que decir cantidad_xp!
                motivo="Bonus de consistencia en tareas", # <-- ¡No olvides esta línea!
                fecha=fecha_pasada
            )
            db.add(historial)
            
            if i < 5: # Solo unas pocas notificaciones recientes
                notif = Notificacion(
                    usuario_id=admin.id, 
                    titulo="Actividad Reciente",
                    mensaje=f"Nuevo registro de actividad el {fecha_pasada.strftime('%Y-%m-%d')}",
                    leida=False
                )
                db.add(notif)

        db.commit()
        print("✅ Historial de XP y Notificaciones generados.")
        print("¡Base de datos lista para la presentación!")

    except Exception as e:
        db.rollback()
        print(f"Error al poblar la base de datos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()