from flask import Flask, render_template, redirect, url_for, request, flash, session, jsonify
import requests
import functools
import os
import time
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from flask_wtf.csrf import CSRFProtect

load_dotenv()

API_URL = "http://api:8000/api/v1"
API_KEY = os.getenv("API_KEY", "ABC123")

app = Flask(__name__)

RUTINAS_MOLDES = {
    "manana_maestra": {
        "id": "manana_maestra",
        "nombre": "Mañana Maestra",
        "tiempo": "45 Mins",
        "descripcion": "Comienza tu día con intención y claridad usando esta secuencia respaldada científicamente.",
        "detalle": "Esta rutina está diseñada para optimizar tus niveles de cortisol matutino y establecer una base mental sólida. Al combinar movimiento suave con reflexión intencional, preparas tu cerebro para un rendimiento cognitivo máximo durante el día.",
        "color_corner": "bg-purple-50",
        "color_icon_bg": "bg-gradient-to-br from-primary to-indigo-600 shadow-primary/20",
        "color_task_check": "bg-green-50 text-green-500",
        "color_btn": "bg-primary text-white shadow-primary/20 hover:bg-primary-hover border-transparent",
        "icono": "wb_sunny",
        "tareas": [
            {"titulo": "Hidratación", "descripcion": "Beber 500ml de agua con limón", "xp_recompensa": 5, "tiempo": "5m"},
            {"titulo": "Estiramiento", "descripcion": "Movilidad ligera para despertar el cuerpo", "xp_recompensa": 10, "tiempo": "10m"},
            {"titulo": "Meditación", "descripcion": "Enfoque en la respiración y presencia", "xp_recompensa": 15, "tiempo": "10m"},
            {"titulo": "Diario de gratitud", "descripcion": "Escribir 3 cosas por las que estás agradecido", "xp_recompensa": 5, "tiempo": "5m"},
            {"titulo": "Planificación", "descripcion": "Revisar agenda y prioridades del día", "xp_recompensa": 15, "tiempo": "15m"}
        ]
    },
    "prep_trabajo_profundo": {
        "id": "prep_trabajo_profundo",
        "nombre": "Prep. Trabajo Profundo",
        "tiempo": "15 Mins",
        "descripcion": "Elimina distracciones y prepara tu cerebro para una sesión de enfoque intenso.",
        "detalle": "Desconecta del mundo exterior para concentrarte al 100%.",
        "color_corner": "bg-blue-50",
        "color_icon_bg": "bg-gradient-to-br from-blue-600 to-cyan-500 shadow-blue-500/20",
        "color_task_check": "bg-blue-50 text-blue-500",
        "color_btn": "bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-50 group-hover:border-blue-500",
        "icono": "psychology",
        "tareas": [
            {"titulo": "Limpiar escritorio", "descripcion": "Ordena tu área de trabajo física", "xp_recompensa": 5, "tiempo": "5m"},
            {"titulo": "Bloquear notificaciones", "descripcion": "Silencia el teléfono y cierra pestañas extra", "xp_recompensa": 5, "tiempo": "5m"},
            {"titulo": "Timer de 90m", "descripcion": "Configura un temporizador para tu sesión", "xp_recompensa": 5, "tiempo": "5m"}
        ]
    },
    "cierre_dia": {
        "id": "cierre_dia",
        "nombre": "Cierre del Día",
        "tiempo": "30 Mins",
        "descripcion": "Desconéctate del trabajo y prepárate para un sueño reparador para recargar energías.",
        "detalle": "Prepara tu mente y tu entorno para un descanso profundo y de calidad.",
        "color_corner": "bg-indigo-50",
        "color_icon_bg": "bg-gradient-to-br from-indigo-500 to-purple-700 shadow-indigo-500/20",
        "color_task_check": "bg-indigo-50 text-indigo-500",
        "color_btn": "bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 group-hover:border-indigo-500",
        "icono": "nights_stay",
        "tareas": [
            {"titulo": "Revisar tareas completadas", "descripcion": "Marca las misiones terminadas", "xp_recompensa": 5, "tiempo": "10m"},
            {"titulo": "Reflexiones del diario", "descripcion": "Escribe lo mejor de tu día", "xp_recompensa": 5, "tiempo": "10m"},
            {"titulo": "Preparar lista de mañana", "descripcion": "Anota tus prioridades de mañana", "xp_recompensa": 5, "tiempo": "10m"}
        ]
    },
    "reinicio_rapido": {
        "id": "reinicio_rapido",
        "nombre": "Reinicio Rápido",
        "tiempo": "10 Mins",
        "descripcion": "Impulso rápido de energía para combatir el bajón de media tarde.",
        "detalle": "Restablece tu nivel de energía de forma natural en solo unos minutos.",
        "color_corner": "bg-teal-50",
        "color_icon_bg": "bg-gradient-to-br from-teal-400 to-emerald-600 shadow-teal-500/20",
        "color_task_check": "bg-teal-50 text-teal-500",
        "color_btn": "bg-white border-2 border-teal-100 text-teal-600 hover:bg-teal-50 group-hover:border-teal-500",
        "icono": "battery_charging_full",
        "tareas": [
            {"titulo": "Beber Agua", "descripcion": "Un vaso completo de agua fresca", "xp_recompensa": 5, "tiempo": "2m"},
            {"titulo": "Respiración cuadrada", "descripcion": "Técnica 4-4-4-4 para relajación", "xp_recompensa": 5, "tiempo": "3m"},
            {"titulo": "Caminar / Estirar", "descripcion": "Levántate y muévete", "xp_recompensa": 5, "tiempo": "5m"}
        ]
    },
    "resumen_semanal": {
        "id": "resumen_semanal",
        "nombre": "Resumen Semanal",
        "tiempo": "60 Mins",
        "descripcion": "Analiza el rendimiento de la semana pasada y planifica la siguiente.",
        "detalle": "Evalúa tus avances y ajusta tus velas para la próxima semana.",
        "color_corner": "bg-orange-50",
        "color_icon_bg": "bg-gradient-to-br from-orange-400 to-pink-500 shadow-orange-500/20",
        "color_task_check": "bg-orange-50 text-orange-500",
        "color_btn": "bg-white border-2 border-orange-100 text-orange-600 hover:bg-orange-50 group-hover:border-orange-500",
        "icono": "calendar_month",
        "tareas": [
            {"titulo": "Limpiar bandeja de entrada", "descripcion": "Pon tu email a cero", "xp_recompensa": 15, "tiempo": "20m"},
            {"titulo": "Revisar calendario", "descripcion": "Ver los eventos de la semana próxima", "xp_recompensa": 10, "tiempo": "15m"},
            {"titulo": "Fijar objetivos semanales", "descripcion": "3 metas principales", "xp_recompensa": 25, "tiempo": "25m"}
        ]
    },
    "tormenta_creativa": {
        "id": "tormenta_creativa",
        "nombre": "Tormenta Creativa",
        "tiempo": "90 Mins",
        "descripcion": "Tiempo no estructurado para lluvia de ideas, ideación y pensamiento libre.",
        "detalle": "Desata tu creatividad sin límites ni juicios para encontrar nuevas soluciones.",
        "color_corner": "bg-fuchsia-50",
        "color_icon_bg": "bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-fuchsia-500/20",
        "color_task_check": "bg-fuchsia-50 text-fuchsia-500",
        "color_btn": "bg-white border-2 border-fuchsia-100 text-fuchsia-600 hover:bg-fuchsia-50 group-hover:border-fuchsia-500",
        "icono": "lightbulb",
        "tareas": [
            {"titulo": "Mapas mentales", "descripcion": "Plasmar ideas principales", "xp_recompensa": 15, "tiempo": "30m"},
            {"titulo": "Mood Boarding", "descripcion": "Búsqueda de referencias visuales", "xp_recompensa": 10, "tiempo": "30m"},
            {"titulo": "Bocetaje", "descripcion": "Bocetos rápidos de posibles soluciones", "xp_recompensa": 25, "tiempo": "30m"}
        ]
    }
}

app.secret_key = os.getenv('SECRET_KEY', 'priority_pulse_mvp_secure_key')
app.config['GOOGLE_CLIENT_ID'] = os.getenv('GOOGLE_CLIENT_ID', '829015896198-o8n8oqdbvmbkja1fh7trj2iqgsbv44a6.apps.googleusercontent.com')
csrf = CSRFProtect(app)


app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

def api_request(method, path, **kwargs):
    """
    Wrapper for requests to inject API Key and JWT Bearer token headers.
    """
    headers = kwargs.get('headers', {})
    headers['x-api-key'] = API_KEY

    
    if 'access_token' in session:
        headers['Authorization'] = f"Bearer {session['access_token']}"
        
    kwargs['headers'] = headers
    
    url = f"{API_URL}{path}"
    return requests.request(method, url, **kwargs)

@app.context_processor
def inject_global_user():
    global_user = None
    if 'usuario_id' in session:
        try:
            res = api_request('GET', f'/usuarios/{session["usuario_id"]}')
            if res.status_code == 200:
                global_user = res.json()
        except Exception:
            pass
    return dict(global_user=global_user)

def login_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if 'usuario_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    if 'usuario_id' in session:
        return redirect(url_for('inicio'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'usuario_id' in session:
        return redirect(url_for('inicio'))
        
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        try:
            # Login now returns flat structure including access_token
            response = api_request('POST', '/usuarios/login', json={"correo": email, "password": password})
            if response.status_code == 200:
                user = response.json()
                session['usuario_id'] = user['id']
                session['nombre_usuario'] = user['nombre_usuario']
                session['foto_perfil'] = user.get('foto_perfil')
                session['access_token'] = user['access_token']
                return redirect(url_for('inicio'))
            else:
                flash('Credenciales incorrectas.', 'error')
        except Exception as e:
            flash('Error conectando con autenticación.', 'error')
    return render_template('/auth/login.html')

@app.route('/login/google', methods=['POST'])
def google_login():
    id_token = request.form.get('id_token')
    if not id_token:
        flash('Token de Google no recibido.', 'error')
        return redirect(url_for('login'))
        
    try:
        response = api_request('POST', '/usuarios/google', json={"id_token": id_token})
        print(f"DEBUG Google Login Response Status: {response.status_code}")
        print(f"DEBUG Google Login Response Text: {response.text}")
        if response.status_code == 200:
            user = response.json()
            session['usuario_id'] = user['id']
            session['nombre_usuario'] = user['nombre_usuario']
            session['foto_perfil'] = user.get('foto_perfil')
            session['access_token'] = user['access_token']
            return redirect(url_for('inicio'))
        elif response.status_code == 202:
            # Usuario nuevo, redirigir a elegir nametag
            data = response.json()
            session['temp_google_token'] = id_token
            session['temp_google_name'] = data.get('google_name', '')
            session['temp_google_email'] = data.get('email', '')
            return redirect(url_for('google_register_view'))
        else:
            try:
                err_data = response.json()
                detail = err_data.get('detail', 'Error al autenticar con Google.')
                flash(f"Error Google: {detail}", 'error')
            except Exception:
                flash(f"Error al autenticar con Google ({response.status_code}).", 'error')
    except Exception as e:
        print(f"DEBUG Google Login Exception: {e}")
        flash('Error al procesar la autenticación de Google.', 'error')
    return redirect(url_for('login'))


@app.route('/registro/google', methods=['GET', 'POST'])
def google_register_view():
    # Solo permitir acceso si hay un token temporal en la sesión
    if 'temp_google_token' not in session:
        return redirect(url_for('login'))
        
    if request.method == 'POST':
        nametag = request.form.get('nombre_usuario')
        if not nametag:
            flash('Por favor, ingresa un nametag.', 'error')
            return redirect(url_for('google_register_view'))
            
        id_token = session.get('temp_google_token')
        try:
            response = api_request('POST', '/usuarios/google/register', json={
                "id_token": id_token,
                "nombre_usuario": nametag
            })
            
            if response.status_code == 200:
                user = response.json()
                # Limpiar sesión temporal
                session.pop('temp_google_token', None)
                session.pop('temp_google_name', None)
                session.pop('temp_google_email', None)
                
                # Iniciar sesión
                session['usuario_id'] = user['id']
                session['nombre_usuario'] = user['nombre_usuario']
                session['foto_perfil'] = user.get('foto_perfil')
                session['access_token'] = user['access_token']
                flash('¡Bienvenido! Tu cuenta ha sido creada exitosamente.', 'success')
                return redirect(url_for('inicio'))
            else:
                try:
                    err_data = response.json()
                    detail = err_data.get('detail', 'Error al crear la cuenta.')
                    flash(detail, 'error')
                except Exception:
                    flash('Error al crear la cuenta con Google.', 'error')
        except Exception as e:
            print(f"DEBUG Google Register Exception: {e}")
            flash('Error de conexión.', 'error')
            
        return redirect(url_for('google_register_view'))
        
    # GET method
    return render_template('auth/google_register.html', 
                          google_name=session.get('temp_google_name', 'Nuevo Usuario'),
                          google_email=session.get('temp_google_email', ''))

def registro():
    if 'usuario_id' in session:
        return redirect(url_for('inicio'))
        
    if request.method == 'POST':
        fullname = request.form.get('fullname')
        email = request.form.get('email')
        nametag = request.form.get('nametag')
        password = request.form.get('password')
        try:
            payload = {"correo": email, "nombre_usuario": fullname, "password": password}
            response = api_request('POST', '/usuarios/', json=payload)
            if response.status_code in [200, 201]:
                # Automatically log in the user after registration to obtain the JWT token
                login_resp = api_request('POST', '/usuarios/login', json={"correo": email, "password": password})
                if login_resp.status_code == 200:
                    user = login_resp.json()
                    session['usuario_id'] = user['id']
                    session['nombre_usuario'] = user['nombre_usuario']
                    session['access_token'] = user['access_token']
                    return redirect(url_for('inicio'))
                else:
                    return redirect(url_for('login'))
            else:
                flash('Error al crear cuenta. ' + response.text, 'error')
        except Exception as e:
            flash('Error registrando usuario.', 'error')
    return render_template('/auth/registro.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/terminos')
def terminos():
    return render_template('/legal/terminos.html')

@app.route('/privacidad')
def privacidad():
    return render_template('/legal/privacidad.html')

@app.route('/inicio')
@login_required
def inicio():
    tareas = []
    rutinas = []
    usuario_id = session['usuario_id']

    usuario_info = {
        "nombre": session.get('nombre_usuario', 'Usuario'),
        "nivel": 1,
        "xp": 0,
        "xp_siguiente": 500,
        "racha": 0
    }
    
    try:
        # Verificar y resetear racha si han pasado mas de 24h
        api_request('POST', f'/usuarios/{usuario_id}/check-streak')

        # Fetch tasks and routines for specific user
        # Note: /tareas/ endpoint is restricted to admins only, so we fetch /tareas/usuario/{usuario_id}
        # to prevent unauthorized access errors and enforce BOLA/IDOR compliance
        from datetime import datetime
        fecha_hoy = datetime.now().strftime('%Y-%m-%d')
        response_tareas = api_request('GET', f'/tareas/usuario/{usuario_id}?fecha={fecha_hoy}')
        if response_tareas.status_code == 200:
            tareas_data = response_tareas.json()
            tareas = [t for t in tareas_data if t.get('rutina_id') is None]
            
        response_rutinas = api_request('GET', f'/rutinas/usuario/{usuario_id}')
        if response_rutinas.status_code == 200:
            rutinas = response_rutinas.json()

        response_user = api_request('GET', f'/usuarios/{usuario_id}')
        if response_user.status_code == 200:
            u_data = response_user.json()
            xp_total = u_data.get('xp_total', 0)
            nivel = (xp_total // 500) + 1
            xp_siguiente = nivel * 500
            
            usuario_info['xp'] = xp_total
            usuario_info['nivel'] = nivel
            usuario_info['xp_siguiente'] = xp_siguiente
            usuario_info['racha'] = u_data.get('racha_actual', 0)

    except Exception as e:
        print(f"Error cargando desde FastAPI: {e}")
        
    return render_template('/inicio/inicio.html', tareas=tareas, rutinas=rutinas, usuario=usuario_info)
@app.route('/api/tareas')
@login_required
def api_tareas():
    usuario_id = session.get('usuario_id')
    fecha = request.args.get('fecha')
    
    url = f'/tareas/usuario/{usuario_id}'
    if fecha:
        url += f'?fecha={fecha}'
        
    response = api_request('GET', url)
    if response.status_code == 200:
        return jsonify(response.json())
    return jsonify({"error": "Error interno"}), 400

@app.route('/crear-tarea', methods=['POST'])
@login_required
def crear_tarea():
    titulo = request.form.get('titulo')
    descripcion = request.form.get('descripcion')
    fecha_limite = request.form.get('fecha_limite')
    prioridad = request.form.get('prioridad')
    tags = request.form.get('tags')
    rutina_id = request.form.get('rutina_id')
    
    emoji = request.form.get('emoji')
    repeticion = request.form.get('repeticion')
    tiempo_inicio = request.form.get('tiempo_inicio')
    tiempo_fin = request.form.get('tiempo_fin')
    recordatorio_hora = request.form.get('recordatorio_hora')
    
    es_critica = False
    xp_recompensa = 10
    
    if prioridad and prioridad.isdigit():
        p_val = int(prioridad)
        xp_recompensa = p_val
        if p_val >= 80:
            es_critica = True
            
    payload = {
        "titulo": titulo,
        "descripcion": descripcion,
        "usuario_id": session['usuario_id'],
        "es_critica": es_critica,
        "xp_recompensa": xp_recompensa,
        "estado": "pendiente"
    }
    
    if fecha_limite:
        payload["fecha_limite"] = fecha_limite
    if tags:
        payload["tags"] = tags
    if rutina_id:
        payload["rutina_id"] = int(rutina_id)
    if emoji:
        payload["emoji"] = emoji
    if repeticion:
        payload["repeticion"] = repeticion
    if tiempo_inicio:
        payload["tiempo_inicio"] = tiempo_inicio
    if tiempo_fin:
        payload["tiempo_fin"] = tiempo_fin
    if recordatorio_hora:
        payload["recordatorio_hora"] = recordatorio_hora
    
    try:
        response = api_request('POST', '/tareas/', json=payload)
        if response.status_code == 201:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return {"success": True, "tarea": response.json()}
            flash('¡Tarea creada exitosamente!', 'success')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return {"success": False, "error": "Ocurrió un problema al guardar la tarea."}, 400
            flash('Ocurrió un problema al guardar la tarea.', 'error')
    except Exception as e:
        print(f"Error conectando a FastAPI: {e}")
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return {"success": False, "error": "Error de conexión con el servidor."}, 500
        flash('Error de conexión con el servidor.', 'error')
        
    return redirect(url_for('inicio'))

@app.route('/editar-tarea/<int:tarea_id>', methods=['POST'])
@login_required
def editar_tarea(tarea_id):
    titulo = request.form.get('titulo')
    descripcion = request.form.get('descripcion')
    fecha_limite = request.form.get('fecha_limite')
    prioridad = request.form.get('prioridad')
    tags = request.form.get('tags')
    rutina_id = request.form.get('rutina_id')
    emoji = request.form.get('emoji')
    repeticion = request.form.get('repeticion')
    tiempo_inicio = request.form.get('tiempo_inicio')
    tiempo_fin = request.form.get('tiempo_fin')
    recordatorio_hora = request.form.get('recordatorio_hora')
    
    es_critica = False
    xp_recompensa = 10
    
    if prioridad and prioridad.isdigit():
        p_val = int(prioridad)
        xp_recompensa = p_val
        if p_val >= 80:
            es_critica = True
            
    payload = {
        "titulo": titulo,
        "descripcion": descripcion,
        "es_critica": es_critica,
        "xp_recompensa": xp_recompensa
    }
    
    if rutina_id is not None:
        if rutina_id == "none" or rutina_id == "":
            payload["rutina_id"] = None
        else:
            payload["rutina_id"] = int(rutina_id)
    
    if fecha_limite:
        payload["fecha_limite"] = fecha_limite
    if tags:
        payload["tags"] = tags
    if emoji:
        payload["emoji"] = emoji
    if repeticion:
        payload["repeticion"] = repeticion
    if tiempo_inicio:
        payload["tiempo_inicio"] = tiempo_inicio
    if tiempo_fin:
        payload["tiempo_fin"] = tiempo_fin
    if recordatorio_hora:
        payload["recordatorio_hora"] = recordatorio_hora
    apply_to_series = request.form.get('apply_to_series', 'false').lower() == 'true'
    
    try:
        response = api_request('PUT', f'/tareas/{tarea_id}?apply_to_series={str(apply_to_series).lower()}', json=payload)
        if response.status_code == 200:
            flash('Tarea actualizada correctamente.', 'success')
        else:
            flash('No se pudo actualizar la tarea.', 'error')
    except Exception as e:
        print(f"Error conectando a FastAPI: {e}")
        flash('Error de conexión con el servidor.', 'error')
        
    return redirect(url_for('inicio'))

@app.route('/eliminar-tarea/<int:tarea_id>', methods=['POST'])
@login_required
def eliminar_tarea(tarea_id):
    apply_to_series = request.form.get('apply_to_series', 'false').lower() == 'true'
    try:
        response = api_request('DELETE', f'/tareas/{tarea_id}?apply_to_series={str(apply_to_series).lower()}')
        if response.status_code == 204:
            flash('La tarea fue eliminada.', 'success')
        else:
            flash('Hubo un error al intentar eliminar la tarea.', 'error')
    except Exception as e:
        print(f"Error conectando a FastAPI: {e}")
        flash('Error de conexión con el servidor.', 'error')
        
    return redirect(url_for('inicio'))

@app.route('/crear-rutina', methods=['POST'])
@login_required
def crear_rutina():
    nombre = request.form.get('nombre')
    
    payload = {
        "nombre": nombre,
        "usuario_id": session['usuario_id'],
        "esta_activa": True
    }
    
    try:
        response = api_request('POST', '/rutinas/', json=payload)
        if response.status_code == 201:
            flash('¡Rutina creada exitosamente!', 'success')
        else:
            flash('Error al crear rutina.', 'error')
    except Exception as e:
        print(f"Error conectando a FastAPI: {e}")
        flash('Error de conexión con el servidor.', 'error')
        
    return redirect(url_for('inicio'))

@app.route('/agregar-rutina-molde', methods=['POST'])
@login_required
def agregar_rutina_molde():
    molde_id = request.form.get('molde')
    
    if molde_id in RUTINAS_MOLDES:
        molde_data = RUTINAS_MOLDES[molde_id]
        rutina_payload = {
            "nombre": molde_data["nombre"],
            "usuario_id": session['usuario_id'],
            "esta_activa": True
        }
        
        try:
            res_rut = api_request('POST', '/rutinas/', json=rutina_payload)
            if res_rut.status_code == 201:
                rutina_id = res_rut.json().get('id')
                
                for t in molde_data["tareas"]:
                    t_payload = {
                        "titulo": t["titulo"],
                        "descripcion": t["descripcion"],
                        "usuario_id": session['usuario_id'],
                        "es_critica": False,
                        "xp_recompensa": t["xp_recompensa"],
                        "estado": "pendiente",
                        "rutina_id": rutina_id,
                        "tags": "Rutina"
                    }
                    api_request('POST', '/tareas/', json=t_payload)
                    
                flash(f'¡Rutina "{molde_data["nombre"]}" añadida a tu día!', 'success')
            else:
                flash('Error al añadir la rutina desde la biblioteca.', 'error')
        except Exception as e:
            print(f"Error conectando a FastAPI: {e}")
            flash('Error de conexión con el servidor.', 'error')
            
    return redirect(url_for('inicio'))

@app.route('/eliminar-rutina/<int:rutina_id>', methods=['POST'])
@login_required
def eliminar_rutina(rutina_id):
    try:
        response = api_request('DELETE', f'/rutinas/{rutina_id}')
        if response.status_code == 204:
            flash('La rutina fue eliminada.', 'success')
        else:
            flash('Hubo un error al intentar eliminar la rutina.', 'error')
    except Exception as e:
        print(f"Error conectando a FastAPI: {e}")
        flash('Error de conexión con el servidor.', 'error')
        
    return redirect(url_for('inicio'))

@app.route('/toggle-tarea/<int:tarea_id>', methods=['POST'])
@login_required
def toggle_tarea(tarea_id):
    try:
        usuario_id = session.get('usuario_id')
        racha_before = 0
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' and usuario_id:
            user_res_before = api_request('GET', f'/usuarios/{usuario_id}')
            if user_res_before.status_code == 200:
                racha_before = user_res_before.json().get('racha_actual', 0)
                
        res = api_request('GET', f'/tareas/{tarea_id}')
        if res.status_code == 200:
            tarea = res.json()
            nuevo_estado = "completada" if tarea.get("estado") != "completada" else "pendiente"
            
            payload = {
                "estado": nuevo_estado
            }
            put_res = api_request('PUT', f'/tareas/{tarea_id}', json=payload)
            
            if put_res.status_code == 200:
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest' and usuario_id:
                    user_res = api_request('GET', f'/usuarios/{usuario_id}')
                    nuevo_xp = 0
                    xp_siguiente = 0
                    racha_incrementada = False
                    racha_actual = 0
                    
                    if user_res.status_code == 200:
                        u_data = user_res.json()
                        nuevo_xp = u_data.get('xp_total', 0)
                        nivel_actual = u_data.get('nivel', 1)
                        xp_siguiente = nivel_actual * 100
                        racha_actual = u_data.get('racha_actual', 0)
                        
                        if nuevo_estado == "completada" and racha_actual > racha_before:
                            racha_incrementada = True
                            
                    return {"success": True, "estado": nuevo_estado, "nuevo_xp": nuevo_xp, "xp_siguiente": xp_siguiente, "racha_incrementada": racha_incrementada, "racha_actual": racha_actual}
                
                if nuevo_estado == "completada":
                    flash('¡Excelente! Tarea completada. +XP', 'success')
                    flash('Tarea desmarcada.', 'info')
            else:
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return {"success": False, "error": "Error al actualizar la tarea."}, 400
                flash('Error al actualizar la tarea.', 'error')
    except Exception as e:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return {"success": False, "error": "Error de conexión con el servidor."}, 500
        flash('Error de conexión con el servidor.', 'error')
        
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return {"success": False}, 400
    return redirect(url_for('inicio'))

@app.route('/rutinas')
@login_required
def rutinas():
    return render_template('/rutinas/rutinas.html', rutinas_moldes=RUTINAS_MOLDES.values())

@app.route('/clasificacion')
@login_required
def clasificacion():
    usuarios = []
    try:
        response = api_request('GET', '/usuarios/leaderboard?limit=50')
        if response.status_code == 200:
            usuarios = response.json()
        elif response.status_code == 401:
            flash('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 'error')
            return redirect(url_for('logout'))
        else:
            print(f"Leaderboard error {response.status_code}: {response.text}", flush=True)
    except Exception as e:
        print(f"Error conectando a FastAPI: {e}", flush=True)
    return render_template('/inicio/clasificacion.html', usuarios=usuarios)

@app.route('/perfil/<int:usuario_id>')
@login_required
def perfil_publico(usuario_id):
    if usuario_id == session.get('usuario_id'):
        return redirect(url_for('perfil'))
        
    usuario = {}
    estado_amistad = "ninguna"
    
    try:
        # Fetch usuario
        res_u = api_request('GET', f'/usuarios/{usuario_id}')
        if res_u.status_code == 200:
            u_data = res_u.json()
            usuario.update(u_data)
            
            xp_total = usuario.get('xp_total', 0)
            nivel = (xp_total // 500) + 1
            
            usuario['nivel'] = nivel
            
            # Titulos dinamicos
            if nivel <= 3:
                usuario['titulo'] = "Iniciado del Enfoque"
            elif nivel <= 6:
                usuario['titulo'] = "Practicante Disciplinado"
            elif nivel <= 10:
                usuario['titulo'] = "Maestro de Tareas"
            else:
                usuario['titulo'] = "Arquitecto de Enfoque"
        elif res_u.status_code == 404:
            flash('Usuario no encontrado.', 'error')
            return redirect(url_for('clasificacion'))
            
        # Fetch estado amistad
        res_estado = api_request('GET', f'/amistades/estado/{usuario_id}')
        amistad_id = None
        if res_estado.status_code == 200:
            data = res_estado.json()
            estado_amistad = data.get('estado', 'ninguna')
            amistad_id = data.get('id')
            
    except Exception as e:
        print(f"Error conectando a FastAPI en perfil publico: {e}")
        
    if not usuario:
        return "<div class='p-8 text-center text-red-500'>No se pudo cargar el perfil del usuario.</div>", 404
        
    return render_template('/perfil/perfil_publico_modal.html', usuario=usuario, estado_amistad=estado_amistad, target_id=usuario_id, amistad_id=amistad_id)

@app.route('/amistades/solicitar/<int:usuario_id>', methods=['POST'])
@login_required
def enviar_solicitud_amistad(usuario_id):
    try:
        payload = {
            "usuario_id_1": session['usuario_id'],
            "usuario_id_2": usuario_id
        }
        res = api_request('POST', '/amistades/solicitudes', json=payload)
        if res.status_code == 201:
            flash('Solicitud de amistad enviada.', 'success')
        elif res.status_code == 400:
            flash(res.json().get('detail', 'Error al enviar solicitud.'), 'error')
        else:
            flash('No se pudo enviar la solicitud.', 'error')
    except Exception as e:
        print(f"Error al enviar solicitud: {e}")
        flash('Error de conexión.', 'error')
        
    return redirect(url_for('clasificacion'))

@app.route('/amistades/aceptar/<int:amistad_id>', methods=['POST'])
@login_required
def aceptar_solicitud_amistad(amistad_id):
    try:
        res = api_request('PUT', f'/amistades/{amistad_id}', json={"estado": "aceptada"})
        if res.status_code == 200:
            flash('Solicitud de amistad aceptada.', 'success')
        else:
            flash('No se pudo aceptar la solicitud.', 'error')
    except Exception as e:
        print(f"Error al aceptar solicitud: {e}")
        flash('Error de conexión.', 'error')
        
    return redirect(url_for('clasificacion'))

@app.route('/amistades/eliminar/<int:amistad_id>', methods=['POST'])
@login_required
def eliminar_amistad(amistad_id):
    try:
        res = api_request('DELETE', f'/amistades/{amistad_id}')
        if res.status_code == 204:
            flash('Amistad o solicitud eliminada exitosamente.', 'success')
        else:
            flash('No se pudo eliminar la amistad o solicitud.', 'error')
    except Exception as e:
        print(f"Error al eliminar amistad: {e}")
        flash('Error de conexión.', 'error')
        
    return redirect(url_for('clasificacion'))

@app.route('/perfil')
@login_required
def perfil():
    usuario = {
        'nombre_usuario': session.get('nombre_usuario', 'Usuario'),
        'nivel': 1,
        'xp_total': 0,
        'racha_actual': 0,
        'progreso_pct': 0,
        'titulo': 'Iniciado del Enfoque',
        'correo': ''
    }
    tareas = []
    amistades = []
    calendario = {}
    
    try:
        usuario_id = session['usuario_id']
        # Fetch usuario
        res_u = api_request('GET', f'/usuarios/{usuario_id}')
        if res_u.status_code == 200:
            u_data = res_u.json()
            usuario.update(u_data)
            
            xp_total = usuario.get('xp_total', 0)
            nivel = (xp_total // 500) + 1
            xp_siguiente = nivel * 500
            xp_nivel_actual = xp_total % 500
            progreso_pct = (xp_nivel_actual / 500.0) * 100
            
            usuario['nivel'] = nivel
            usuario['xp_siguiente'] = xp_siguiente
            usuario['progreso_pct'] = progreso_pct
            
            # Titulos dinamicos
            if nivel <= 3:
                usuario['titulo'] = "Iniciado del Enfoque"
            elif nivel <= 6:
                usuario['titulo'] = "Practicante Disciplinado"
            elif nivel <= 10:
                usuario['titulo'] = "Maestro de Tareas"
            else:
                usuario['titulo'] = "Arquitecto de Enfoque"
        elif res_u.status_code == 401:
            flash('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 'error')
            return redirect(url_for('logout'))

        # Fetch Tareas
        res_t = api_request('GET', f'/tareas/usuario/{usuario_id}')
        if res_t.status_code == 200:
            tareas_data = res_t.json()
            tareas = [t for t in tareas_data if t.get('rutina_id') is None]
            
            for t in tareas_data:
                if t.get('fecha_limite'):
                    try:
                        fecha_str = t['fecha_limite'][:10]
                        calendario[fecha_str] = calendario.get(fecha_str, 0) + 1
                    except:
                        pass
                        
        # Fetch Amistades
        res_a = api_request('GET', f'/amistades/usuario/{usuario_id}')
        if res_a.status_code == 200:
            amistades_data = res_a.json()
            # Las amistades tienen usuario_id_1 y usuario_id_2, necesitamos buscar los detalles del otro usuario
            # Como FastAPI /amistades/usuario/{id} devuelve las relaciones, filtramos para sacar el id del amigo
            for am in amistades_data:
                if am['estado'] == 'aceptada':
                    amigo_id = am['usuario_id_2'] if am['usuario_id_1'] == usuario_id else am['usuario_id_1']
                    # Fetch detalles del amigo
                    res_amigo = api_request('GET', f'/usuarios/{amigo_id}')
                    if res_amigo.status_code == 200:
                        amistades.append(res_amigo.json())
            
    except Exception as e:
        print(f"Error conectando a FastAPI en perfil: {e}")
        
    import json
    return render_template('/perfil/perfil.html', usuario=usuario, total_tareas=len(tareas), amistades=amistades, calendario=json.dumps(calendario))

@app.route('/editar-perfil', methods=['GET', 'POST'])
@login_required
def editar_perfil():
    if request.method == 'POST':
        nombre = request.form.get('nombre')
        nombre_usuario = request.form.get('nombre_usuario')
        correo = request.form.get('correo')
        
        foto_perfil_file = request.files.get('foto_perfil_file')
        foto_perfil = None
        
        if foto_perfil_file and foto_perfil_file.filename != '':
            filename = secure_filename(str(time.time()) + "_" + foto_perfil_file.filename)
            upload_path = os.path.join(app.root_path, 'static', 'uploads')
            os.makedirs(upload_path, exist_ok=True)
            foto_perfil_file.save(os.path.join(upload_path, filename))
            foto_perfil = f"/static/uploads/{filename}"
        
        payload = {}
        if nombre: payload["nombre"] = nombre
        if nombre_usuario: payload["nombre_usuario"] = nombre_usuario
        if correo: payload["correo"] = correo
        if foto_perfil: payload["foto_perfil"] = foto_perfil
        
        try:
            res = api_request('PUT', f'/usuarios/{session["usuario_id"]}', json=payload)
            if res.status_code == 200:
                # Update session variables
                if nombre_usuario: session['nombre_usuario'] = nombre_usuario
                if nombre: session['nombre'] = nombre
                if foto_perfil: session['foto_perfil'] = foto_perfil
                flash('Perfil actualizado con éxito.', 'success')
            else:
                flash('No se pudo actualizar el perfil.', 'error')
        except Exception as e:
            flash('Error de conexión con el servidor.', 'error')
        return redirect(url_for('perfil'))
    else:
        usuario = {}
        is_oauth = False
        try:
            res = api_request('GET', f'/usuarios/{session["usuario_id"]}')
            if res.status_code == 200:
                usuario = res.json()
            
            # Checar si es OAuth
            res_oauth = api_request('GET', f'/usuarios/{session["usuario_id"]}/is-oauth')
            if res_oauth.status_code == 200:
                is_oauth = res_oauth.json().get('is_oauth', False)
        except Exception as e:
            print(f"Error conectando a FastAPI: {e}")
        return render_template('/perfil/editar.html', usuario=usuario, is_oauth=is_oauth)

@app.route('/cambiar-password', methods=['POST'])
@login_required
def cambiar_password():
    password_actual = request.form.get('password_actual')
    nueva_password = request.form.get('nueva_password')
    confirmar_password = request.form.get('confirmar_password')
    
    if not password_actual or not nueva_password or not confirmar_password:
        flash('Todos los campos son obligatorios.', 'error')
        return redirect(url_for('editar_perfil'))
        
    if nueva_password != confirmar_password:
        flash('Las contraseñas nuevas no coinciden.', 'error')
        return redirect(url_for('editar_perfil'))
        
    if len(nueva_password) < 8:
        flash('La nueva contraseña debe tener al menos 8 caracteres.', 'error')
        return redirect(url_for('editar_perfil'))
        
    payload = {
        "password_actual": password_actual,
        "nueva_password": nueva_password
    }
    
    try:
        res = api_request('PUT', f'/usuarios/{session["usuario_id"]}/password', json=payload)
        if res.status_code == 200:
            flash('Contraseña actualizada correctamente.', 'success')
        elif res.status_code == 400:
            flash('La contraseña actual es incorrecta.', 'error')
        else:
            flash('Error al actualizar la contraseña.', 'error')
    except Exception as e:
        flash('Error de conexión con el servidor.', 'error')
        
    return redirect(url_for('editar_perfil'))

@app.route('/eliminar-cuenta', methods=['POST'])
@login_required
def eliminar_cuenta():
    try:
        res = api_request('DELETE', f'/usuarios/{session["usuario_id"]}')
        if res.status_code == 200:
            session.clear()
            flash('Tu cuenta ha sido eliminada permanentemente.', 'success')
            return redirect(url_for('login'))
        else:
            flash('No se pudo eliminar la cuenta.', 'error')
    except Exception as e:
        flash('Error de conexión con el servidor.', 'error')
        
    return redirect(url_for('editar_perfil'))

@app.route('/ajustes-notificaciones', methods=['GET', 'POST'])
@login_required
def ajustes_notificaciones():
    if request.method == 'POST':
        session['notif_diarias'] = request.form.get('notif_diarias') == 'on'
        session['notif_tareas'] = request.form.get('notif_tareas') == 'on'
        session['notif_amigos'] = request.form.get('notif_amigos') == 'on'
        session['notif_promociones'] = request.form.get('notif_promociones') == 'on'
        
        flash('Preferencias de notificaciones guardadas.', 'success')
        return redirect(url_for('ajustes_notificaciones'))
        
    prefs = {
        'diarias': session.get('notif_diarias', True),
        'tareas': session.get('notif_tareas', True),
        'amigos': session.get('notif_amigos', True),
        'promociones': session.get('notif_promociones', False)
    }
    return render_template('/notificaciones/ajuste.html', prefs=prefs)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)