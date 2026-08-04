import sys
import os

# Add the FastAPI directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import sesionLocal
from app.models.nivel import Nivel
from app.models.medalla import Medalla, UsuarioMedalla
from app.models.usuario import Usuario
from app.models.amistad import Amistad
from app.core.security import obtener_password_hash

def seed_db():
    db = sesionLocal()
    try:
        print("Borrando datos existentes...")
        db.query(Amistad).delete()
        db.query(UsuarioMedalla).delete()
        db.query(Usuario).delete()
        db.query(Medalla).delete()
        db.query(Nivel).delete()
        db.commit()
        
        print("Creando niveles...")
        niveles_data = [
            {"numero_nivel": 1, "nombre": "Novato", "xp_requerida": 0, "color_hex": "#808080", "icono": "star"},
            {"numero_nivel": 2, "nombre": "Aprendiz", "xp_requerida": 100, "color_hex": "#cd7f32", "icono": "military_tech"},
            {"numero_nivel": 3, "nombre": "Iniciado", "xp_requerida": 300, "color_hex": "#c0c0c0", "icono": "shield"},
            {"numero_nivel": 4, "nombre": "Intermedio", "xp_requerida": 600, "color_hex": "#ffd700", "icono": "workspace_premium"},
            {"numero_nivel": 5, "nombre": "Avanzado", "xp_requerida": 1000, "color_hex": "#00ff00", "icono": "local_fire_department"},
            {"numero_nivel": 6, "nombre": "Experto", "xp_requerida": 1500, "color_hex": "#0000ff", "icono": "diamond"},
            {"numero_nivel": 7, "nombre": "Maestro", "xp_requerida": 2100, "color_hex": "#800080", "icono": "psychology"},
            {"numero_nivel": 8, "nombre": "Gran Maestro", "xp_requerida": 2800, "color_hex": "#ff00ff", "icono": "school"},
            {"numero_nivel": 9, "nombre": "Leyenda", "xp_requerida": 3600, "color_hex": "#ff0000", "icono": "whatshot"},
            {"numero_nivel": 10, "nombre": "Mítico", "xp_requerida": 4500, "color_hex": "#000000", "icono": "rocket_launch"}
        ]
        
        for n_data in niveles_data:
            db.add(Nivel(**n_data))
        db.commit()

        print("Creando medallas...")
        medallas_data = [
            {"nombre": "Primer Paso", "descripcion": "Completaste tu primera tarea.", "url_icono": "emoji_events", "tipo_trigger": "tareas_completadas", "valor_requerido": 1},
            {"nombre": "Constancia", "descripcion": "Alcanzaste una racha de 3 días.", "url_icono": "local_fire_department", "tipo_trigger": "racha_dias", "valor_requerido": 3},
            {"nombre": "Socializador", "descripcion": "Agregaste a tu primer amigo.", "url_icono": "group", "tipo_trigger": "amigos_agregados", "valor_requerido": 1},
            {"nombre": "Máquina de Tareas", "descripcion": "Completaste 10 tareas.", "url_icono": "task_alt", "tipo_trigger": "tareas_completadas", "valor_requerido": 10},
            {"nombre": "Invencible", "descripcion": "Alcanzaste una racha de 7 días.", "url_icono": "diamond", "tipo_trigger": "racha_dias", "valor_requerido": 7}
        ]
        for m_data in medallas_data:
            db.add(Medalla(**m_data))
        db.commit()

        print("Creando usuarios de prueba...")
        nivel_1 = db.query(Nivel).filter(Nivel.numero_nivel == 1).first()
        nivel_3 = db.query(Nivel).filter(Nivel.numero_nivel == 3).first()

        admin_user = Usuario(
            nombre="Admin Priority Pulse",
            nombre_usuario="admin",
            correo="admin@prioritypulse.com",
            password_hash=obtener_password_hash("admin123"),
            rol="admin",
            nivel_id=nivel_3.id if nivel_3 else 1,
            xp_total=350,
            racha_actual=5
        )
        user_1 = Usuario(
            nombre="Juan Perez",
            nombre_usuario="juanperez",
            correo="juan@example.com",
            password_hash=obtener_password_hash("password123"),
            rol="usuario",
            nivel_id=nivel_1.id if nivel_1 else 1,
            xp_total=50,
            racha_actual=1
        )
        user_2 = Usuario(
            nombre="Maria Gomez",
            nombre_usuario="mariagomez",
            correo="maria@example.com",
            password_hash=obtener_password_hash("password123"),
            rol="usuario",
            nivel_id=nivel_1.id if nivel_1 else 1,
            xp_total=10,
            racha_actual=0
        )
        
        db.add_all([admin_user, user_1, user_2])
        db.commit()

        print("Asignando medallas y amistades...")
        medalla_1 = db.query(Medalla).filter(Medalla.nombre == "Primer Paso").first()
        medalla_2 = db.query(Medalla).filter(Medalla.nombre == "Constancia").first()

        db.add(UsuarioMedalla(usuario_id=admin_user.id, medalla_id=medalla_1.id))
        db.add(UsuarioMedalla(usuario_id=admin_user.id, medalla_id=medalla_2.id))
        db.add(UsuarioMedalla(usuario_id=user_1.id, medalla_id=medalla_1.id))

        db.add(Amistad(usuario_id_1=admin_user.id, usuario_id_2=user_1.id, estado="aceptada"))
        db.add(Amistad(usuario_id_1=user_1.id, usuario_id_2=user_2.id, estado="pendiente"))
        
        db.commit()
        print("¡Base de datos sembrada correctamente!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
