<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\NivelController;
use App\Http\Controllers\DashboardController;

// ─── Rutas Públicas (sin autenticación) ─────────────────────────────────────
Route::get('/login', [LoginController::class, 'showLogin'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.post');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// ─── Rutas Protegidas (requieren sesión Admin) ───────────────────────────────
Route::middleware('admin.auth')->group(function () {

Route::get('/dashboard', function () {
    return view('dashboard.index');
});

Route::get('/analitica', function () {
    return view('dashboard.analitica');
});

Route::get('/configuracion', function () {
    return view('config.configuracion');
});

Route::get('/seguridad', function () {
    return view('config.seguridad');
});

Route::get('/notificaciones', function () {
    return view('config.notificaciones');
});

Route::get('/gamificacion', function () {
    return view('config.gamificacion');
});

