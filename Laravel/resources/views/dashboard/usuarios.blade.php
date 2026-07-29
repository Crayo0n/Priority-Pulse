@extends('layout.app')

@section('title', 'Gestión de Usuarios - Priority Pulse')

@section('content')
<div class="flex h-full w-full bg-white overflow-hidden min-h-0">
    
    {{-- ===== TABLA PRINCIPAL ===== --}}
    <div class="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 lg:p-8 h-full">
        
        <div class="mb-6">
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Gestión de Usuarios</h1>
            <p class="text-sm text-gray-500 mt-1">
                Administra la comunidad — 
                <span class="font-bold text-gray-800">{{ count($usuarios) }} usuarios</span> registrados en el sistema.
            </p>
        </div>

        {{-- Barra de herramientas --}}
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {{-- Exportar CSV --}}
                <button onclick="exportarCSV()" class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Exportar CSV
                </button>
                
                {{-- Buscador --}}
                <div class="relative flex-1 sm:flex-none">
                    <svg class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input id="buscador" type="text" placeholder="Buscar por nombre, ID o email..."
                        oninput="filtrarUsuarios()"
                        class="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full sm:w-72 focus:outline-none focus:border-[#6e00ff] focus:ring-1 focus:ring-[#6e00ff] transition">
                </div>
            </div>

            <div class="text-sm text-gray-500 font-medium">
                Mostrando <span id="contador-visible" class="font-bold text-gray-900">{{ count($usuarios) }}</span>
                de <span class="font-bold text-gray-900">{{ count($usuarios) }}</span> usuarios
            </div>
        </div>

        {{-- Tabla --}}
        <div class="border border-gray-200 rounded-xl overflow-x-auto bg-white shadow-sm mb-6">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-[#fcfaff] text-[0.75rem] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        <th class="px-6 py-4">Usuario</th>
                        <th class="px-6 py-4">Nivel / XP</th>
                        <th class="px-6 py-4">Racha</th>
                        <th class="px-6 py-4">Rol</th>
                        <th class="px-6 py-4 text-right">Acción</th>
                    </tr>
                </thead>
                <tbody id="tabla-body" class="divide-y divide-gray-100">
                    @forelse($usuarios as $usuario)
                    <tr class="fila-usuario hover:bg-gray-50 transition cursor-pointer"
                        data-nombre="{{ strtolower($usuario['nombre_usuario']) }}"
                        data-correo="{{ strtolower($usuario['correo']) }}"
                        data-id="{{ $usuario['id'] }}"
                        onclick="mostrarPanel({{ json_encode($usuario) }})">

                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-[#f3ebff] text-[#6e00ff] flex items-center justify-center font-black border border-purple-200 text-base flex-shrink-0">
                                    {{ strtoupper(substr($usuario['nombre_usuario'], 0, 1)) }}
                                </div>
                                <div>
                                    <div class="font-bold text-gray-900">{{ $usuario['nombre_usuario'] }}</div>
                                    <div class="text-xs text-gray-400">{{ $usuario['correo'] }} · ID {{ $usuario['id'] }}</div>
                                </div>
                            </div>
                        </td>

                        <td class="px-6 py-4">
                            @if($usuario['rol'] === 'admin')
                                <span class="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full inline-block">Admin (N/A)</span>
                            @else
                                <div class="font-extrabold text-[#6e00ff]">Lvl {{ $usuario['nivel_id'] ?? 1 }}</div>
                                <div class="text-xs font-bold text-[#6e00ff] bg-[#f3ebff] px-2 py-0.5 rounded-full inline-block mt-1">
                                    {{ number_format($usuario['xp_total']) }} XP
                                </div>
                            @endif
                        </td>

                        <td class="px-6 py-4">
                            @if($usuario['rol'] === 'admin')
                                <span class="text-xs font-medium text-gray-400">—</span>
                            @else
                                <div class="flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-sm font-bold w-max border border-orange-100">
                                    🔥 {{ $usuario['racha_actual'] }} días
                                </div>
                            @endif
                        </td>

                        <td class="px-6 py-4">
                            <span class="text-xs font-bold px-2 py-1 rounded-full
                                {{ $usuario['rol'] === 'admin' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700' }}">
                                {{ ucfirst($usuario['rol']) }}
                            </span>
                        </td>

                        <td class="px-6 py-4 text-right">
                            <button onclick="event.stopPropagation(); mostrarPanel({{ json_encode($usuario) }})"
                                class="text-xs font-bold text-[#6e00ff] hover:underline">Ver perfil →</button>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-gray-400">
                            <svg class="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            No se encontraron usuarios desde la API.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{-- Sin resultados de búsqueda --}}
        <div id="no-resultados" class="hidden text-center py-10 text-gray-400 text-sm font-semibold">
            No se encontraron usuarios que coincidan con la búsqueda.
        </div>

    </div>

    {{-- ===== PANEL LATERAL / MODAL RESPONSIVO ===== --}}
    <div id="panel-backdrop" onclick="cerrarPanel()" class="fixed inset-0 bg-black/50 z-40 lg:hidden hidden backdrop-blur-sm transition-opacity duration-300"></div>

    <div id="panel-usuario"
         class="fixed inset-y-0 right-0 w-full sm:w-96 lg:static lg:w-80 z-50 lg:z-auto bg-white border-l border-gray-200 transform translate-x-full lg:translate-x-0 transition-transform duration-300 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.05)] lg:shadow-none">

        {{-- Estado vacío --}}
        <div id="panel-vacio" class="flex flex-col items-center justify-center flex-1 text-center px-8 text-gray-400">
            <svg class="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <p class="text-sm font-semibold">Selecciona un usuario<br>para ver su perfil.</p>
        </div>

        {{-- Contenido del usuario seleccionado --}}
        <div id="panel-contenido" class="hidden flex-col h-full bg-white overflow-y-auto">

            <div class="p-6 text-center border-b border-gray-100 relative">
                <button onclick="cerrarPanel()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div class="w-20 h-20 rounded-full bg-gradient-to-br from-[#6e00ff] to-[#9b51e0] flex items-center justify-center font-black text-3xl text-white mx-auto mb-3 shadow-lg" id="panel-avatar"></div>
                <h2 class="text-lg font-extrabold text-gray-900" id="panel-nombre"></h2>
                <p class="text-xs text-gray-400 mt-1" id="panel-correo"></p>
                <div class="flex justify-center gap-2 mt-3">
                    <span id="panel-rol-badge" class="text-xs font-bold px-3 py-1 rounded-full"></span>
                </div>
            </div>

            {{-- Stats del usuario (Normal) --}}
            <div id="section-stats-usuario" class="p-6 border-b border-gray-100">
                <h3 class="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Estadísticas</h3>
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-[#faf8ff] border border-[#ede0ff] rounded-xl p-3 text-center">
                        <div class="text-xl font-black text-[#6e00ff]" id="panel-xp"></div>
                        <div class="text-xs text-gray-500 font-semibold mt-0.5">XP Total</div>
                    </div>
                    <div class="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
                        <div class="text-xl font-black text-orange-500" id="panel-racha">🔥 0</div>
                        <div class="text-xs text-gray-500 font-semibold mt-0.5">Racha actual</div>
                    </div>
                    <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center col-span-2">
                        <div class="text-xl font-black text-emerald-600" id="panel-nivel"></div>
                        <div class="text-xs text-gray-500 font-semibold mt-0.5">Nivel Actual</div>
                    </div>
                </div>
            </div>

            {{-- Banner para Administrador (Sin stats de juego) --}}
            <div id="section-stats-admin" class="p-6 border-b border-gray-100 hidden">
                <div class="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                    <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2 font-black text-lg shadow-sm">
                        🛡️
                    </div>
                    <div class="font-extrabold text-red-700 text-sm">Cuenta de Administrador</div>
                    <p class="text-xs text-red-500 mt-1 font-medium">Los administradores gestionan el sistema y no acumulan nivel, XP ni racha de juego.</p>
                </div>
            </div>

            {{-- Info adicional --}}
            <div class="p-6 border-b border-gray-100">
                <h3 class="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Información</h3>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-500">ID de usuario</span>
                        <span class="font-bold text-gray-800" id="panel-id"></span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Correo</span>
                        <span class="font-bold text-gray-800 text-xs truncate max-w-36" id="panel-correo-info"></span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Rol</span>
                        <span class="font-bold text-gray-800" id="panel-rol-text"></span>
                    </div>
                </div>
            </div>

            {{-- Acciones de Administrador --}}
            <div class="p-6 bg-gray-50 flex-1 space-y-3">
                <h3 class="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Acciones de Administrador</h3>
                
                <button id="btn-cambiar-rol" onclick="abrirModalRol()"
                    class="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition shadow-sm flex items-center justify-center gap-2">
                    <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    <span id="label-cambiar-rol">Cambiar Rol</span>
                </button>

                <button id="btn-eliminar-usuario" onclick="abrirModalEliminar()"
                    class="w-full py-2.5 px-4 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 hover:bg-red-100 transition shadow-sm flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Eliminar Usuario
                </button>

                <div id="warning-cuenta-propia" class="hidden text-center py-2 px-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p class="text-[0.7rem] font-bold text-amber-700">⚠️ Es tu propia cuenta de sesión activa. No puedes cambiar tu propio rol ni eliminarte.</p>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- ===== MODAL CONFIRMAR ELIMINACIÓN ===== --}}
<div id="modal-eliminar" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden transition-opacity duration-300 opacity-0">
    <div id="modal-eliminar-box" class="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 text-center transform scale-95 transition-transform duration-300">
        <div class="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
        </div>

        <h3 class="text-xl font-extrabold text-gray-900 mb-2">Eliminar Usuario</h3>
        <p class="text-sm text-gray-500 mb-6">
            ¿Estás seguro de que deseas eliminar permanentemente a <span id="modal-eliminar-nombre" class="font-bold text-gray-900"></span> (<span id="modal-eliminar-correo" class="text-gray-600"></span>)? Esta acción no se puede deshacer.
        </p>

        <div class="flex items-center justify-end gap-3">
            <button type="button" onclick="cerrarModalEliminar()" class="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition">
                Cancelar
            </button>
            <button type="button" id="btn-confirmar-eliminar" onclick="ejecutarEliminacion()" class="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition shadow-md shadow-red-200 flex items-center gap-2">
                <span id="btn-eliminar-texto">Sí, eliminar</span>
                <svg id="btn-eliminar-spinner" class="w-4 h-4 animate-spin hidden" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </button>
        </div>
    </div>
</div>

{{-- ===== MODAL CAMBIAR ROL ===== --}}
<div id="modal-rol" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden transition-opacity duration-300 opacity-0">
    <div id="modal-rol-box" class="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 text-center transform scale-95 transition-transform duration-300">
        <div class="w-14 h-14 rounded-full bg-purple-50 text-[#6e00ff] flex items-center justify-center mx-auto mb-4 border border-purple-100 shadow-sm">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
        </div>

        <h3 class="text-xl font-extrabold text-gray-900 mb-2">Cambiar Rol de Usuario</h3>
        <p class="text-sm text-gray-500 mb-6">
            ¿Deseas cambiar el rol de <span id="modal-rol-nombre" class="font-bold text-gray-900"></span> a <span id="modal-rol-nuevo" class="font-bold text-[#6e00ff]"></span>?
        </p>

        <div class="flex items-center justify-end gap-3">
            <button type="button" onclick="cerrarModalRol()" class="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition">
                Cancelar
            </button>
            <button type="button" id="btn-confirmar-rol" onclick="ejecutarCambioRol()" class="px-5 py-2.5 rounded-xl bg-[#6e00ff] text-white font-bold text-xs hover:bg-[#5b00d6] transition shadow-md shadow-purple-200 flex items-center gap-2">
                <span id="btn-rol-texto">Confirmar Cambio</span>
                <svg id="btn-rol-spinner" class="w-4 h-4 animate-spin hidden" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </button>
        </div>
    </div>
</div>

{{-- TOAST NOTIFICACIÓN --}}
<div id="toast-notificacion" class="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 bg-gray-900 text-white rounded-xl shadow-2xl text-sm font-semibold transition-all duration-300 transform translate-y-10 opacity-0 pointer-events-none">
    <span id="toast-icono"></span>
    <span id="toast-mensaje"></span>
</div>

{{-- Datos JSON para JS --}}
<script>
const todosUsuarios = @json($usuarios);
const currentAdminId = @json(session('admin_id'));

let usuarioSeleccionado = null;

function mostrarPanel(u) {
    usuarioSeleccionado = u;
    // Poblar datos
    document.getElementById('panel-avatar').textContent = u.nombre_usuario.charAt(0).toUpperCase();
    document.getElementById('panel-nombre').textContent = u.nombre_usuario;
    document.getElementById('panel-correo').textContent = u.correo;
    document.getElementById('panel-correo-info').textContent = u.correo;
    document.getElementById('panel-id').textContent = '#' + u.id;
    document.getElementById('panel-xp').textContent = Number(u.xp_total).toLocaleString() + ' XP';
    document.getElementById('panel-racha').textContent = '🔥 ' + u.racha_actual + ' días';
    document.getElementById('panel-nivel').textContent = 'Nivel ' + (u.nivel_id ?? 1);
    document.getElementById('panel-rol-text').textContent = u.rol.charAt(0).toUpperCase() + u.rol.slice(1);

    // Ocultar estadísticas si el usuario es Administrador
    const sectionUserStats = document.getElementById('section-stats-usuario');
    const sectionAdminStats = document.getElementById('section-stats-admin');
    if (u.rol === 'admin') {
        if (sectionUserStats) sectionUserStats.classList.add('hidden');
        if (sectionAdminStats) sectionAdminStats.classList.remove('hidden');
    } else {
        if (sectionUserStats) sectionUserStats.classList.remove('hidden');
        if (sectionAdminStats) sectionAdminStats.classList.add('hidden');
    }

    const labelBtn = document.getElementById('label-cambiar-rol');
    if (labelBtn) {
        labelBtn.textContent = u.rol === 'admin' ? 'Hacer Usuario Normal' : 'Ascender a Admin';
    }

    const badge = document.getElementById('panel-rol-badge');
    if (u.rol === 'admin') {
        badge.className = 'text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700';
    } else {
        badge.className = 'text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700';
    }
    badge.textContent = u.rol.charAt(0).toUpperCase() + u.rol.slice(1);

    // Protección para la propia cuenta activa del admin en sesión
    const btnCambiarRol = document.getElementById('btn-cambiar-rol');
    const btnEliminar = document.getElementById('btn-eliminar-usuario');
    const warningPropia = document.getElementById('warning-cuenta-propia');

    if (currentAdminId && u.id == currentAdminId) {
        if (btnCambiarRol) {
            btnCambiarRol.disabled = true;
            btnCambiarRol.classList.add('opacity-50', 'cursor-not-allowed');
            btnCambiarRol.classList.remove('hover:bg-gray-100');
        }
        if (btnEliminar) {
            btnEliminar.disabled = true;
            btnEliminar.classList.add('opacity-50', 'cursor-not-allowed');
            btnEliminar.classList.remove('hover:bg-red-100');
        }
        if (warningPropia) warningPropia.classList.remove('hidden');
    } else {
        if (btnCambiarRol) {
            btnCambiarRol.disabled = false;
            btnCambiarRol.classList.remove('opacity-50', 'cursor-not-allowed');
            btnCambiarRol.classList.add('hover:bg-gray-100');
        }
        if (btnEliminar) {
            btnEliminar.disabled = false;
            btnEliminar.classList.remove('opacity-50', 'cursor-not-allowed');
            btnEliminar.classList.add('hover:bg-red-100');
        }
        if (warningPropia) warningPropia.classList.add('hidden');
    }

    // Mostrar/ocultar secciones
    document.getElementById('panel-vacio').style.display = 'none';
    document.getElementById('panel-contenido').style.display = 'flex';
    
    // Slide-in para móvil
    document.getElementById('panel-usuario').classList.remove('translate-x-full');
    document.getElementById('panel-backdrop').classList.remove('hidden');

    // Resaltar fila activa
    document.querySelectorAll('.fila-usuario').forEach(r => r.classList.remove('bg-purple-50', 'ring-1', 'ring-inset', 'ring-purple-200'));
    document.querySelectorAll('.fila-usuario').forEach(r => {
        if (r.dataset.id == u.id) r.classList.add('bg-purple-50');
    });
}

function abrirModalRol() {
    if (!usuarioSeleccionado) return;
    if (currentAdminId && usuarioSeleccionado.id == currentAdminId) {
        mostrarToast('No puedes modificar el rol de tu propia cuenta activa', 'error');
        return;
    }
    const nuevoRol = usuarioSeleccionado.rol === 'admin' ? 'Usuario Normal' : 'Administrador';
    document.getElementById('modal-rol-nombre').textContent = usuarioSeleccionado.nombre_usuario;
    document.getElementById('modal-rol-nuevo').textContent = nuevoRol;

    const modal = document.getElementById('modal-rol');
    const box = document.getElementById('modal-rol-box');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        box.classList.remove('scale-95');
        box.classList.add('scale-100');
    }, 10);
}

function cerrarModalRol() {
    const modal = document.getElementById('modal-rol');
    const box = document.getElementById('modal-rol-box');
    modal.classList.add('opacity-0');
    box.classList.remove('scale-100');
    box.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function ejecutarCambioRol() {
    if (!usuarioSeleccionado) return;
    const nuevoRol = usuarioSeleccionado.rol === 'admin' ? 'user' : 'admin';

    const btn = document.getElementById('btn-confirmar-rol');
    const txt = document.getElementById('btn-rol-texto');
    const spinner = document.getElementById('btn-rol-spinner');

    btn.disabled = true;
    txt.textContent = 'Actualizando...';
    spinner.classList.remove('hidden');

    fetch(`/api/usuarios/${usuarioSeleccionado.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({ rol: nuevoRol })
    })
    .then(r => r.json())
    .then(data => {
        if (data.ok) {
            cerrarModalRol();
            mostrarToast('Rol actualizado correctamente', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            cerrarModalRol();
            mostrarToast('Error al cambiar el rol: ' + (data.data?.detail || 'Operación fallida'), 'error');
            btn.disabled = false;
            txt.textContent = 'Confirmar Cambio';
            spinner.classList.add('hidden');
        }
    })
    .catch(() => {
        cerrarModalRol();
        mostrarToast('Error de conexión con la API', 'error');
        btn.disabled = false;
        txt.textContent = 'Confirmar Cambio';
        spinner.classList.add('hidden');
    });
}

function abrirModalEliminar() {
    if (!usuarioSeleccionado) return;
    if (currentAdminId && usuarioSeleccionado.id == currentAdminId) {
        mostrarToast('No puedes eliminar tu propia cuenta de sesión activa', 'error');
        return;
    }
    document.getElementById('modal-eliminar-nombre').textContent = usuarioSeleccionado.nombre_usuario;
    document.getElementById('modal-eliminar-correo').textContent = usuarioSeleccionado.correo;

    const modal = document.getElementById('modal-eliminar');
    const box = document.getElementById('modal-eliminar-box');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        box.classList.remove('scale-95');
        box.classList.add('scale-100');
    }, 10);
}

function cerrarModalEliminar() {
    const modal = document.getElementById('modal-eliminar');
    const box = document.getElementById('modal-eliminar-box');
    modal.classList.add('opacity-0');
    box.classList.remove('scale-100');
    box.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function ejecutarEliminacion() {
    if (!usuarioSeleccionado) return;

    const btn = document.getElementById('btn-confirmar-eliminar');
    const txt = document.getElementById('btn-eliminar-texto');
    const spinner = document.getElementById('btn-eliminar-spinner');

    btn.disabled = true;
    txt.textContent = 'Eliminando...';
    spinner.classList.remove('hidden');

    fetch(`/api/usuarios/${usuarioSeleccionado.id}`, {
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then(r => r.json())
    .then(data => {
        if (data.ok) {
            cerrarModalEliminar();
            mostrarToast('Usuario eliminado correctamente', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            cerrarModalEliminar();
            mostrarToast('Error al eliminar el usuario', 'error');
            btn.disabled = false;
            txt.textContent = 'Sí, eliminar';
            spinner.classList.add('hidden');
        }
    })
    .catch(() => {
        cerrarModalEliminar();
        mostrarToast('Error de conexión con la API', 'error');
        btn.disabled = false;
        txt.textContent = 'Sí, eliminar';
        spinner.classList.add('hidden');
    });
}

function mostrarToast(mensaje, tipo = 'info') {
    const toast = document.getElementById('toast-notificacion');
    const msg = document.getElementById('toast-mensaje');
    const ico = document.getElementById('toast-icono');

    msg.textContent = mensaje;
    ico.innerHTML = tipo === 'success' ? '✅' : (tipo === 'error' ? '❌' : 'ℹ️');

    toast.classList.remove('translate-y-10', 'opacity-0', 'pointer-events-none');
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0', 'pointer-events-none');
    }, 3500);
}


function cerrarPanel() {
    // Desktop: Mostrar vacío
    document.getElementById('panel-vacio').style.display = 'flex';
    document.getElementById('panel-contenido').style.display = 'none';
    
    // Slide-out para móvil
    const panel = document.getElementById('panel-usuario');
    if (!window.matchMedia("(min-width: 1024px)").matches) {
        panel.classList.add('translate-x-full');
    }
    document.getElementById('panel-backdrop').classList.add('hidden');

    document.querySelectorAll('.fila-usuario').forEach(r => r.classList.remove('bg-purple-50'));
}

function filtrarUsuarios() {
    const q = document.getElementById('buscador').value.toLowerCase().trim();
    const filas = document.querySelectorAll('.fila-usuario');
    let visibles = 0;

    filas.forEach(fila => {
        const nombre = fila.dataset.nombre || '';
        const correo = fila.dataset.correo || '';
        const id     = fila.dataset.id || '';
        const match  = !q || nombre.includes(q) || correo.includes(q) || id.includes(q);
        fila.style.display = match ? '' : 'none';
        if (match) visibles++;
    });

    document.getElementById('contador-visible').textContent = visibles;
    document.getElementById('no-resultados').classList.toggle('hidden', visibles > 0);
}

function exportarCSV() {
    const cabecera = ['ID','Nombre de Usuario','Correo','Nivel','XP Total','Racha Actual','Rol'];
    const filas = todosUsuarios.map(u => [
        u.id, u.nombre_usuario, u.correo, u.nivel_id ?? 1, u.xp_total, u.racha_actual, u.rol
    ]);
    const csv = [cabecera, ...filas].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'usuarios_priority_pulse.csv';
    a.click();
    URL.revokeObjectURL(url);
}
</script>
@endsection