@extends('layout.app')

@section('title', 'Dashboard - Priority Pulse')

@section('content')
<div class="flex-1 overflow-y-auto p-8 bg-[#f8f9fa] w-full h-full">

    <div class="flex justify-between items-center mb-8">
        <div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Control Operativo</h1>
            <p class="text-sm text-gray-500 mt-1">Visión general del sistema y operaciones en tiempo real.</p>
        </div>
        <div class="flex gap-3">
            <button onclick="window.location.reload()" class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm">
                <svg id="refresh-icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Actualizar
            </button>
        </div>

    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        <!-- Total Usuarios -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div class="flex justify-between items-start mb-2 relative z-10">
                <h3 class="text-sm font-semibold text-gray-500">Usuarios Registrados</h3>
                <div class="p-2 bg-[#f3ebff] text-[#6e00ff] rounded-lg">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
            </div>
            <div class="relative z-10">
                <span class="text-4xl font-black text-gray-900">{{ $stats ? number_format($stats['total_usuarios']) : '—' }}</span>
                <div class="flex items-center gap-2 mt-2">
                    <span class="text-xs font-semibold text-gray-500">Comunidad activa</span>
                </div>
            </div>
        </div>

        <!-- Tareas Hoy -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div class="flex justify-between items-start mb-2 relative z-10">
                <h3 class="text-sm font-semibold text-gray-500">Tareas Creadas Hoy</h3>
                <div class="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
            </div>
            <div class="relative z-10">
                <span class="text-4xl font-black text-gray-900">{{ $stats ? number_format($stats['tareas_creadas_hoy']) : '—' }}</span>
                <div class="flex items-center gap-2 mt-2">
                    <span class="text-xs text-gray-400">Total en sistema:</span>
                    <span class="text-xs font-bold text-blue-600">{{ $stats ? number_format($stats['total_tareas']) : '—' }}</span>
                </div>
            </div>
        </div>

        <!-- Medallas Desbloqueadas -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div class="flex justify-between items-start mb-2 relative z-10">
                <h3 class="text-sm font-semibold text-gray-500">Medallas Desbloqueadas</h3>
                <div class="p-2 bg-orange-100 text-orange-500 rounded-lg">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
            </div>
            <div class="relative z-10">
                <span class="text-4xl font-black text-gray-900">{{ $stats ? number_format($stats['medallas_desbloqueadas']) : '—' }}</span>
                <div class="mt-2">
                    <span class="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded flex items-center w-max gap-1 border border-orange-200">
                        Catálogo: {{ $stats ? $stats['total_medallas_catalogo'] : '0' }} tipos
                    </span>
                </div>
            </div>
        </div>

        <!-- XP Total y Racha -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div class="flex justify-between items-start mb-2 relative z-10">
                <h3 class="text-sm font-semibold text-gray-500">XP Total Generada</h3>
                <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
            </div>
            <div class="relative z-10">
                <span class="text-3xl font-black text-emerald-600">{{ $stats ? number_format($stats['xp_total_generada']) : '0' }}</span>
                <div class="flex items-center gap-2 mt-2">
                    <span class="text-xs font-bold text-gray-700">Racha Promed.: 🔥 {{ $stats ? $stats['racha_promedio'] : '0.0' }} días</span>
                </div>
            </div>
        </div>

    </div>


    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-lg font-bold text-gray-900">Distribución por Nivel</h2>
                <a href="{{ route('analitica') }}" class="text-xs font-bold text-[#6e00ff] hover:underline">Ver Analítica →</a>
            </div>
            <div class="space-y-3">
                @if($stats && count($stats['niveles_funnel']) > 0)
                    @foreach($stats['niveles_funnel'] as $nivel)
                    <div class="flex items-center gap-4">
                        <div class="w-24 text-sm font-bold text-gray-700 text-right flex-shrink-0">{{ $nivel['rango'] }}</div>
                        <div class="flex-1 bg-gray-100 rounded-full h-7 flex items-center">
                            @php $pct = max($nivel['porcentaje'], 2); @endphp
                            <div class="bg-gradient-to-r from-[#6e00ff] to-[#9b51e0] h-full rounded-full flex items-center justify-end px-3 text-white text-xs font-bold"
                                 style="width: {{ $pct }}%">
                                @if($nivel['porcentaje'] > 10) {{ $nivel['porcentaje'] }}% @endif
                            </div>
                        </div>
                        <div class="text-xs font-bold text-gray-500 w-12 text-right">{{ number_format($nivel['total_usuarios']) }}</div>
                    </div>
                    @endforeach
                @else
                    <div class="text-center py-8 text-gray-400 text-sm">No hay datos de niveles disponibles.</div>
                @endif
            </div>
        </div>



    </div>
</div>
@endsection