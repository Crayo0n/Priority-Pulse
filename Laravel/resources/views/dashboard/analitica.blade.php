@extends('layout.app')

@section('title', 'Analíticas - Priority Pulse')

@section('content')
<div class="flex-1 overflow-y-auto p-8 bg-[#f8f9fa] w-full h-full">

    <div class="flex justify-between items-start mb-8">
        <div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Analítica de Gamificación</h1>
            <p class="text-sm text-gray-500 mt-1">Monitorización de interacciones RPG, medallas y progresión de usuarios.</p>
        </div>
        
        <div class="flex items-center gap-4">
            
            <a href="{{ route('analitica.exportar') }}" target="_blank"
               class="flex items-center gap-2 px-5 py-2.5 bg-[#6e00ff] rounded-lg text-sm font-bold text-white hover:bg-[#5a00d1] transition shadow-md">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Exportar Reporte
            </a>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <div class="bg-gradient-to-br from-[#6e00ff] to-[#5100bc] p-6 rounded-2xl shadow-md text-white flex flex-col justify-between relative overflow-hidden">
            <div>
                <div class="flex items-center gap-2 text-purple-200 font-semibold text-sm mb-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
                    Días Promedio de Racha
                </div>
                <div class="flex items-baseline gap-1">
                    <span class="text-5xl font-black">{{ $stats ? $stats['racha_promedio'] : '—' }}</span>
                    <span class="text-lg text-purple-200">días</span>
                </div>
                <p class="text-xs text-purple-200 mt-2">Promedio en tiempo real entre todos los usuarios activos.</p>
            </div>
            
            <div class="flex items-end gap-1.5 mt-6 h-10">
                <div class="w-full bg-white/20 rounded-t-sm h-1/4 hover:bg-white/40 transition"></div>
                <div class="w-full bg-white/20 rounded-t-sm h-2/4 hover:bg-white/40 transition"></div>
                <div class="w-full bg-white/20 rounded-t-sm h-1/3 hover:bg-white/40 transition"></div>
                <div class="w-full bg-white/20 rounded-t-sm h-2/3 hover:bg-white/40 transition"></div>
                <div class="w-full bg-white/30 rounded-t-sm h-1/2 hover:bg-white/50 transition"></div>
                <div class="w-full bg-white/40 rounded-t-sm h-3/4 hover:bg-white/60 transition"></div>
                <div class="w-full bg-white/50 rounded-t-sm h-4/5 hover:bg-white/70 transition"></div>
                <div class="w-full bg-white/70 rounded-t-sm h-full hover:bg-white transition"></div>
            </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
                <h3 class="text-sm font-semibold text-gray-500 mb-2">XP Total Generada</h3>
                <span class="text-4xl font-black text-gray-900">{{ $stats ? number_format($stats['xp_total_generada']) . ' XP' : '—' }}</span>
            </div>
            <div class="mt-6">
                @php
                    $xpTotal = $stats['xp_total_generada'] ?? 0;
                    $totalJugadores = max($stats['total_usuarios'] ?? 1, 1);
                    $objetivo = $totalJugadores * 1000;
                    $pctXp = min(round(($xpTotal / max($objetivo, 1)) * 100, 1), 100);
                @endphp
                <div class="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                    <div class="bg-[#6e00ff] h-2 rounded-full transition-all duration-500" style="width: {{ max($pctXp, 2) }}%"></div>
                </div>
                <p class="text-xs text-gray-400 font-medium">{{ $pctXp }}% del objetivo estimado (Meta: {{ number_format($objetivo) }} XP)</p>
            </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
                <h3 class="text-sm font-semibold text-gray-500 mb-2">Medallas Desbloqueadas</h3>
                <span class="text-4xl font-black text-gray-900">{{ $stats ? number_format($stats['medallas_desbloqueadas']) : '—' }}</span>
            </div>
            <div class="mt-6">
                @php
                    $totalCatalogo = $stats['total_medallas_catalogo'] ?? 0;
                    $desbloqueadas = $stats['medallas_desbloqueadas'] ?? 0;
                    $pctMedallas = $totalCatalogo > 0 ? round(($desbloqueadas / ($totalCatalogo * max($totalJugadores, 1))) * 100, 1) : 0;
                @endphp
                <span class="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg flex items-center w-max gap-1 border border-purple-100">
                    🏆 {{ $desbloqueadas }} de {{ $totalCatalogo }} tipo(s) desbloqueada(s)
                </span>
            </div>
        </div>

    </div>

    <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div class="flex items-center gap-2 mb-6">
            <svg class="w-5 h-5 text-[#6e00ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
            <h2 class="text-lg font-bold text-gray-900">Catálogo y Distribución de Medallas</h2>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            @if(isset($medallas) && count($medallas) > 0)
                @foreach($medallas as $i => $medalla)
                <div class="p-4 rounded-xl flex flex-col items-center justify-center hover:scale-105 transition cursor-pointer shadow-sm border border-purple-100 bg-gradient-to-b from-white to-[#faf8ff]"
                     title="{{ $medalla['descripcion'] ?? '' }}">
                    <div class="w-10 h-10 rounded-full bg-purple-100 text-[#6e00ff] flex items-center justify-center mb-2 font-black text-lg shadow-inner">
                        🏅
                    </div>
                    <span class="text-xs font-extrabold text-gray-900 text-center leading-tight">
                        {{ $medalla['nombre'] }}
                    </span>
                    <span class="text-[0.65rem] text-purple-600 font-semibold mt-1 bg-purple-50 px-2 py-0.5 rounded-full text-center truncate max-w-full">
                        {{ $medalla['descripcion'] ?? 'Medalla' }}
                    </span>
                </div>
                @endforeach
            @else
                <div class="col-span-6 text-center py-12 text-gray-400">
                    <svg class="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138"></path></svg>
                    <p class="text-sm font-semibold">No hay medallas registradas en el catálogo todavía.</p>
                </div>
            @endif
        </div>

        <div class="mt-6 flex justify-between items-center text-xs font-semibold text-gray-400 border-t border-gray-100 pt-4">
            <div class="flex items-center gap-2">
                <span>Tipos disponibles en catálogo:</span>
                <span class="font-extrabold text-gray-800">{{ $stats['total_medallas_catalogo'] ?? count($medallas) }}</span>
            </div>
            <div>Medallas otorgadas en total: <span class="font-extrabold text-[#6e00ff]">{{ $stats['medallas_desbloqueadas'] ?? 0 }}</span></div>
        </div>
    </div>

    <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h2 class="text-lg font-bold text-gray-900">Progresión de Niveles (Embudo de Usuarios)</h2>
                <p class="text-xs text-gray-500 mt-1">Distribución y retención de usuarios activos por rangos de nivel.</p>
            </div>
            <span class="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-purple-100">
                <span class="w-1.5 h-1.5 bg-[#6e00ff] rounded-full"></span> {{ $stats['total_usuarios'] ?? 0 }} Jugadores evaluados
            </span>
        </div>

        <div class="space-y-4">
            @php
                $funnel = $stats['niveles_funnel'] ?? [];
                $coloresFunnel = ['#6e00ff','#8b3dff','#9b51e0','#b87cff','#d8b4fe'];
                $primeraFila = $funnel[0]['total_usuarios'] ?? 1;
            @endphp

            @if(count($funnel) > 0)
                @foreach($funnel as $i => $nivel)
                    @php
                        $color = $coloresFunnel[$i] ?? '#6e00ff';
                        $anchoPct = max($nivel['porcentaje'], 6);
                    @endphp

                    <div class="flex items-center gap-4">
                        <div class="w-28 text-sm font-bold text-gray-700 text-right flex-shrink-0">{{ $nivel['rango'] }}</div>
                        <div class="flex-1 bg-gray-50 rounded-full h-9 relative flex items-center overflow-hidden border border-gray-100">
                            <div class="h-full flex items-center justify-between px-4 text-white text-xs font-extrabold transition-all duration-500 rounded-full shadow-sm"
                                 style="width: {{ $anchoPct }}%; background-color: {{ $color }};">
                                <span>{{ $nivel['porcentaje'] }}%</span>
                                <span class="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-[0.65rem]">{{ number_format($nivel['total_usuarios']) }} usuario(s)</span>
                            </div>
                        </div>
                    </div>
                @endforeach
            @else
                <div class="text-center py-10 text-gray-400 text-sm font-semibold">No hay datos de progresión disponibles.</div>
            @endif
        </div>
    </div>

</div>
@endsection