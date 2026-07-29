from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioUpdate, LoginRequest, LoginResponse, GoogleLoginRequest, GoogleRegisterRequest, UsuarioPasswordUpdate

from app.crud import crud_usuario
from app.core.limiter import limiter
from app.core.security import crear_access_token
from app.api.deps import validar_api_key, obtener_usuario_actual, requiere_rol
from app.models.usuario import Usuario

router = APIRouter()


@router.post("/login", response_model=LoginResponse, summary="Autenticación de usuario")
@limiter.limit("5/minute")
def login(
    request: Request,
    payload: LoginRequest,
    api_key_valida: bool = Depends(validar_api_key),
    db: Session = Depends(get_db)
):
    usuario = crud_usuario.autenticar_usuario(db, correo=payload.correo, password=payload.password)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    
    token = crear_access_token(
        usuario_id=usuario.id,
        rol=usuario.rol,
        nombre_usuario=usuario.nombre_usuario
    )
    
    return LoginResponse(
        id=usuario.id,
        nombre_usuario=usuario.nombre_usuario,
        correo=usuario.correo,
        rol=usuario.rol,
        xp_total=usuario.xp_total,
        foto_perfil=usuario.foto_perfil,
        access_token=token,
        token_type="bearer"
    )


@router.post("/login/admin", response_model=LoginResponse, summary="Autenticación de administrador")
@limiter.limit("5/minute")
def login_admin(
    request: Request,
    payload: LoginRequest,
    api_key_valida: bool = Depends(validar_api_key),
    db: Session = Depends(get_db)
):
    usuario = crud_usuario.autenticar_usuario(db, correo=payload.correo, password=payload.password)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    
    if usuario.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requieren privilegios de administrador."
        )
    
    token = crear_access_token(
        usuario_id=usuario.id,
        rol=usuario.rol,
        nombre_usuario=usuario.nombre_usuario
    )
    
    return LoginResponse(
        id=usuario.id,
        nombre_usuario=usuario.nombre_usuario,
        correo=usuario.correo,
        rol=usuario.rol,
        xp_total=usuario.xp_total,
        access_token=token,
        token_type="bearer"
    )



@router.post("/google", response_model=LoginResponse, summary="Autenticación con Google")
@limiter.limit("10/minute")
def google_login(
    request: Request,
    payload: GoogleLoginRequest,
    api_key_valida: bool = Depends(validar_api_key),
    db: Session = Depends(get_db)
):
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        
        # Verify Google ID token
        id_info = id_token.verify_oauth2_token(payload.id_token, google_requests.Request())
        correo = id_info.get("email")
        nombre = id_info.get("name", correo.split("@")[0])
        
        if not correo:
            raise HTTPException(status_code=400, detail="Token de Google no contiene email")
            
        usuario = crud_usuario.get_usuario_by_email(db, correo=correo)
        if not usuario:
            # En lugar de crearlo, devolvemos un 202 indicando que es usuario nuevo
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=202, content={
                "is_new_user": True,
                "email": correo,
                "google_name": nombre,
                "message": "Usuario nuevo, se requiere nametag."
            })
            
        token = crear_access_token(
            usuario_id=usuario.id,
            rol=usuario.rol,
            nombre_usuario=usuario.nombre_usuario
        )
        
        return LoginResponse(
            id=usuario.id,
            nombre_usuario=usuario.nombre_usuario,
            correo=usuario.correo,
            rol=usuario.rol,
            xp_total=usuario.xp_total,
            foto_perfil=usuario.foto_perfil,
            access_token=token,
            token_type="bearer"
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Token de Google inválido: {str(ve)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al autenticar con Google: {str(e)}")

@router.post("/google/register", response_model=LoginResponse, summary="Finalizar registro con Google")
@limiter.limit("5/minute")
def google_register(
    request: Request,
    payload: GoogleRegisterRequest,
    api_key_valida: bool = Depends(validar_api_key),
    db: Session = Depends(get_db)
):
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        
        # Verify Google ID token
        id_info = id_token.verify_oauth2_token(payload.id_token, google_requests.Request())
        correo = id_info.get("email")
        
        if not correo:
            raise HTTPException(status_code=400, detail="Token de Google no contiene email")
            
        # Check if username is taken
        usuario_existente = crud_usuario.get_usuario_by_username(db, username=payload.nombre_usuario)
        if usuario_existente:
            raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso.")
            
        # Check if email is somehow already taken between steps
        usuario_email = crud_usuario.get_usuario_by_email(db, correo=correo)
        if usuario_email:
            raise HTTPException(status_code=400, detail="El correo ya está registrado.")
            
        # Create user
        usuario_data = UsuarioCreate(
            nombre_usuario=payload.nombre_usuario,
            correo=correo,
            password="google_oauth_user_no_password"
        )
        usuario = crud_usuario.crear_usuario(db=db, usuario=usuario_data)
        
        token = crear_access_token(
            usuario_id=usuario.id,
            rol=usuario.rol,
            nombre_usuario=usuario.nombre_usuario
        )
        
        return LoginResponse(
            id=usuario.id,
            nombre_usuario=usuario.nombre_usuario,
            correo=usuario.correo,
            rol=usuario.rol,
            xp_total=usuario.xp_total,
            foto_perfil=usuario.foto_perfil,
            access_token=token,
            token_type="bearer"
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Token de Google inválido: {str(ve)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar con Google: {str(e)}")


@router.post("/", response_model=UsuarioResponse)
@limiter.limit("5/minute")
def create_usuario(
    request: Request,
    usuario: UsuarioCreate,
    api_key_valida: bool = Depends(validar_api_key),
    db: Session = Depends(get_db)
):
    db_usuario = crud_usuario.get_usuario_by_email(db, correo=usuario.correo)
    if db_usuario:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    return crud_usuario.crear_usuario(db=db, usuario=usuario)


@router.get("/", response_model=List[UsuarioResponse])
@limiter.limit("20/minute")
def read_usuarios(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    if usuario_actual.rol != "admin":
        raise HTTPException(status_code=403, detail="Privilegios insuficientes")
    return crud_usuario.get_usuarios(db, skip=skip, limit=limit)



@router.get("/leaderboard", response_model=List[UsuarioResponse])
@limiter.limit("30/minute")
def get_leaderboard(
    request: Request,
    limit: int = 10,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    return crud_usuario.get_usuarios_by_xp(db, limit=limit)


@router.get("/{usuario_id}", response_model=UsuarioResponse)
@limiter.limit("30/minute")
def read_usuario(
    request: Request,
    usuario_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    db_usuario = crud_usuario.get_usuario(db, usuario_id=usuario_id)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_usuario


@router.put("/{usuario_id}", response_model=UsuarioResponse)
@limiter.limit("20/minute")
def update_usuario(
    request: Request,
    usuario_id: int,
    usuario_in: UsuarioUpdate,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection
    if usuario_actual.id != usuario_id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes modificar datos de otro usuario"
            }
        )
        
    db_usuario = crud_usuario.get_usuario(db, usuario_id=usuario_id)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return crud_usuario.update_usuario(db=db, db_usuario=db_usuario, usuario_in=usuario_in)


@router.put("/{usuario_id}/password")
def update_password(usuario_id: int, pw_data: UsuarioPasswordUpdate, db: Session = Depends(get_db)):

    db_usuario = crud_usuario.get_usuario(db, usuario_id=usuario_id)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Validar password actual
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    if not pwd_context.verify(pw_data.password_actual, db_usuario.password_hash):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
        
    db_usuario.password_hash = pwd_context.hash(pw_data.nueva_password)
    db.commit()
    return {"msg": "Contraseña actualizada correctamente"}

@router.get("/{usuario_id}/is-oauth")
def is_oauth_user(usuario_id: int, db: Session = Depends(get_db)):
    db_usuario = crud_usuario.get_usuario(db, usuario_id=usuario_id)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    from app.core.security import verificar_password
    is_oauth = verificar_password("google_oauth_user_no_password", db_usuario.password_hash)
    
    return {"is_oauth": is_oauth}

@router.post("/{usuario_id}/check-streak", response_model=UsuarioResponse)
@limiter.limit("30/minute")
def check_streak(
    request: Request,
    usuario_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection
    if usuario_actual.id != usuario_id and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Acceso denegado",
                "mensaje": "No puedes realizar esta accion en la cuenta de otro usuario"
            }
        )
        
    crud_usuario.verificar_y_resetear_racha(db, usuario_id=usuario_id)
    return crud_usuario.get_usuario(db, usuario_id=usuario_id)


@router.delete("/{usuario_id}", summary="Eliminar usuario (Admin)")
@limiter.limit("10/minute")
def delete_usuario(
    request: Request,
    usuario_id: int,
    api_key_valida: bool = Depends(validar_api_key),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    if usuario_actual.rol != "admin":
        raise HTTPException(status_code=403, detail="Privilegios insuficientes para eliminar usuarios")
    
    db_usuario = crud_usuario.get_usuario(db, usuario_id=usuario_id)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    db.delete(db_usuario)
    db.commit()
    return {"msg": "Usuario eliminado correctamente"}

