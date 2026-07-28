<?php

namespace App\Http\Controllers;

use App\Services\ApiService;
use Illuminate\Http\Request;

class UsuarioController extends Controller
{
    public function index()
    {
        // Fetch All Users globally from FastAPI
        $response = ApiService::get('/usuarios');
        $usuarios = $response->successful() ? $response->json() : [];

        // Return View
        return view('dashboard.usuarios', compact('usuarios'));
    }

    public function update(Request $request, int $id)
    {
        $response = ApiService::put('/usuarios/' . $id, $request->all());
        return response()->json(
            ['ok' => $response->successful(), 'data' => $response->json()],
            $response->successful() ? 200 : $response->status()
        );
    }

    public function destroy(int $id)
    {
        $response = ApiService::delete('/usuarios/' . $id);
        return response()->json(
            ['ok' => $response->successful()],
            $response->successful() ? 200 : $response->status()
        );
    }
}

