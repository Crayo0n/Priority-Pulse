from flask import Flask, render_template, redirect, url_for, request, flash
import requests

API_URL = "http://api:8000/api/v1"

app = Flask(__name__)
app.secret_key = 'priority_pulse_mvp_secure_key'

@app.route('/')
def index():
    return render_template('/auth/login.html')

@app.route('/registro')
def registro():
    return render_template('/auth/registro.html')

@app.route('/terminos')
def terminos():
    return render_template('/legal/terminos.html')

@app.route('/privacidad')
def privacidad():
    return render_template('/legal/privacidad.html')

@app.route('/inicio')
def inicio():
    tareas = []
    usuario_info = {
        "nombre": "MVP Demo User",
        "nivel": 4,
        "xp": 500,
        "xp_siguiente": 1000,
        "racha": 12
    }
    
    try:
        # Traer tareas (solo las que no pertenecen a una rutina)
        response_tareas = requests.get(f'{API_URL}/tareas/')
        if response_tareas.status_code == 200:
            todas_las_tareas = response_tareas.json()
            tareas = [t for t in todas_las_tareas if not t.get('rutina_id')]
            
        # Traer rutinas
        response_rutinas = requests.get(f'{API_URL}/rutinas/usuario/1')
        if response_rutinas.status_code == 200:
            rutinas = response_rutinas.json()
    except Exception as e:
        print(f"Error cargando desde FastAPI: {e}")
        
    return render_template('/inicio/inicio.html', tareas=tareas, rutinas=rutinas, usuario=usuario_info)

@app.route('/crear-tarea', methods=['POST'])
def crear_tarea():
    titulo = request.form.get('titulo')
    descripcion = request.form.get('descripcion')
    fecha_limite = request.form.get('fecha_limite')
    prioridad = request.form.get('prioridad')
    tags = request.form.get('tags')
    rutina_id = request.form.get('rutina_id')
    
    # Calcular propiedades basadas en la prioridad ingresada (1 a 100)
    es_critica = False
    xp_recompensa = 10
    
    if prioridad and prioridad.isdigit():
        p_val = int(prioridad)
        xp_recompensa = p_val  # Otorga XP proporcional a la prioridad
        if p_val >= 80:
            es_critica = True
            
    payload = {
        "titulo": titulo,
        "descripcion": descripcion,
        "usuario_id": 1,
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
    
    try:
        response = requests.post(f'{API_URL}/tareas/', json=payload)
        if response.status_code == 201:
            flash('¡Tarea creada exitosamente!', 'success')
        else:
            flash('Ocurrió un problema al guardar la tarea.', 'error')
    except Exception as e:
        print(f"Error conectando a FastAPI: {e}")
        flash('Error de conexión con el servidor.', 'error')
        
    return redirect(url_for('inicio'))

@app.route('/editar-tarea/<int:tarea_id>', methods=['POST'])
def editar_tarea(tarea_id):
    titulo = request.form.get('titulo')
    descripcion = request.form.get('descripcion')
    fecha_limite = request.form.get('fecha_limite')
    prioridad = request.form.get('prioridad')
    tags = request.form.get('tags')
    
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
    
    if fecha_limite:
        payload["fecha_limite"] = fecha_limite
        
    if tags:
        payload["tags"] = tags
        
    try:
        response = requests.put(f'{API_URL}/tareas/{tarea_id}', json=payload)
        if response.status_code == 200:
            flash('Tarea actualizada correctamente.', 'success')
        else:
            flash('No se pudo actualizar la tarea.', 'error')
    except Exception as e:
        print(f"Error conectando a FastAPI: {e}")
        flash('Error de conexión con el servidor.', 'error')
        
    return redirect(url_for('inicio'))

@app.route('/eliminar-tarea/<int:tarea_id>', methods=['POST'])
def eliminar_tarea(tarea_id):
    try:
        response = requests.delete(f'{API_URL}/tareas/{tarea_id}')
        if response.status_code == 204:
            flash('La tarea fue eliminada.', 'success')
        else:
            flash('Hubo un error al intentar eliminar la tarea.', 'error')
    except Exception as e:
        print(f"Error conectando a FastAPI: {e}")
        flash('Error de conexión con el servidor.', 'error')
        
    return redirect(url_for('inicio'))

@app.route('/crear-rutina', methods=['POST'])
def crear_rutina():
    nombre = request.form.get('nombre')
    
    payload = {
        "nombre": nombre,
        "usuario_id": 1,
        "esta_activa": True
    }
    
    try:
        response = requests.post(f'{API_URL}/rutinas/', json=payload)
        if response.status_code == 201:
            flash('¡Rutina creada exitosamente!', 'success')
        else:
            flash('Error al crear rutina.', 'error')
    except Exception as e:
        print(f"Error conectando a FastAPI: {e}")
        flash('Error de conexión con el servidor.', 'error')
        
    return redirect(url_for('inicio'))

@app.route('/agregar-rutina-molde', methods=['POST'])
def agregar_rutina_molde():
    molde = request.form.get('molde')
    
    if molde == 'manana_maestra':
        rutina_payload = {
            "nombre": "Mañana Maestra",
            "usuario_id": 1,
            "esta_activa": True
        }
        
        try:
            res_rut = requests.post(f'{API_URL}/rutinas/', json=rutina_payload)
            if res_rut.status_code == 201:
                rutina_id = res_rut.json().get('id')
                
                tareas_molde = [
                    {"titulo": "Hidratación", "descripcion": "Beber 500ml de agua con limón", "xp_recompensa": 5},
                    {"titulo": "Estiramiento", "descripcion": "Movilidad ligera para despertar el cuerpo", "xp_recompensa": 10},
                    {"titulo": "Meditación", "descripcion": "Enfoque en la respiración y presencia", "xp_recompensa": 15},
                    {"titulo": "Diario de gratitud", "descripcion": "Escribir 3 cosas por las que estás agradecido", "xp_recompensa": 5},
                    {"titulo": "Planificación", "descripcion": "Revisar agenda y prioridades del día", "xp_recompensa": 15}
                ]
                
                for t in tareas_molde:
                    t_payload = {
                        "titulo": t["titulo"],
                        "descripcion": t["descripcion"],
                        "usuario_id": 1,
                        "es_critica": False,
                        "xp_recompensa": t["xp_recompensa"],
                        "estado": "pendiente",
                        "rutina_id": rutina_id,
                        "tags": "Hábito,Mañana"
                    }
                    requests.post(f'{API_URL}/tareas/', json=t_payload)
                    
                flash('¡Rutina "Mañana Maestra" añadida a tu día!', 'success')
            else:
                flash('Error al añadir la rutina desde la biblioteca.', 'error')
        except Exception as e:
            print(f"Error conectando a FastAPI: {e}")
            flash('Error de conexión con el servidor.', 'error')
            
    return redirect(url_for('inicio'))

@app.route('/eliminar-rutina/<int:rutina_id>', methods=['POST'])
def eliminar_rutina(rutina_id):
    try:
        response = requests.delete(f'{API_URL}/rutinas/{rutina_id}')
        if response.status_code == 204:
            flash('La rutina fue eliminada.', 'success')
        else:
            flash('Hubo un error al intentar eliminar la rutina.', 'error')
    except Exception as e:
        print(f"Error conectando a FastAPI: {e}")
        flash('Error de conexión con el servidor.', 'error')
        
    return redirect(url_for('inicio'))

@app.route('/toggle-tarea/<int:tarea_id>', methods=['POST'])
def toggle_tarea(tarea_id):
    try:
        res = requests.get(f'{API_URL}/tareas/{tarea_id}')
        if res.status_code == 200:
            tarea = res.json()
            nuevo_estado = "completada" if tarea.get("estado") != "completada" else "pendiente"
            
            payload = {
                "estado": nuevo_estado
            }
            put_res = requests.put(f'{API_URL}/tareas/{tarea_id}', json=payload)
            
            if put_res.status_code == 200:
                if nuevo_estado == "completada":
                    flash('¡Excelente! Tarea completada. +XP', 'success')
                else:
                    flash('Tarea desmarcada.', 'info')
            else:
                flash('Error al actualizar la tarea.', 'error')
    except Exception as e:
        flash('Error de conexión con el servidor.', 'error')
        
    return redirect(url_for('inicio'))

@app.route('/rutinas')
def rutinas():
    return render_template('/rutinas/rutinas.html')

@app.route('/clasificacion')
def clasificacion():
    return render_template('/inicio/clasificacion.html')

@app.route('/perfil')
def perfil():
    return render_template('/perfil/perfil.html')

@app.route('/editar-perfil')
def editar_perfil():
    return render_template('/perfil/editar.html')

@app.route('/ajustes-notificaciones')
def ajustes_notificaciones():
    return render_template('/notificaciones/ajuste.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)