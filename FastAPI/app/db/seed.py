import sys
import os

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.database import sesionLocal, engine, Base
from app.models.usuario import Usuario
from app.core.security import obtener_password_hash

def seed_database():
    print("Iniciando sembrado de base de datos...")
    
    # Asegurar que las tablas existan
    Base.metadata.create_all(bind=engine)
    
    db = sesionLocal()
    try:
        # Verificar si ya existe el usuario MVP Demo
        usuario_demo = db.query(Usuario).filter(Usuario.id == 1).first()
        if not usuario_demo:
            print("Creando usuario administrador de demostración...")
            new_user = Usuario(
                id=1,
                nombre_usuario="MVP Demo User",
                correo="demo@prioritypulse.com",
                password_hash=obtener_password_hash("demo123"),  # Contraseña segura hasheada
                rol="admin"
            )
            db.add(new_user)
            db.commit()
            print("¡Usuario semilla creado con éxito! (Correo: demo@prioritypulse.com / Contraseña: demo123)")
        else:
            print("El usuario semilla ya existe en la base de datos.")
            
    except Exception as e:
        print(f"Error durante el sembrado de base de datos: {e}")
        sys.exit(1)
    finally:
        db.close()
        
    print("Sembrado finalizado.")

if __name__ == "__main__":
    seed_database()
