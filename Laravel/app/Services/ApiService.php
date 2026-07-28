<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\PendingRequest;

class ApiService
{
    /**
     * @return PendingRequest
     */
    public static function make()
    {
        $request = Http::baseUrl(env('FASTAPI_BASE_URL', 'http://api:8000/api/v1'))
            ->withHeaders(['X-API-Key' => env('API_KEY', 'ABC123')])
            ->timeout(15)
            ->acceptJson();

        if (session('admin_token')) {
            $request->withToken(session('admin_token'));
        }

        return $request;
    }



    public static function get($endpoint, $queryParams = [])
    {
        return self::make()->get($endpoint, $queryParams);
    }

    public static function post($endpoint, $data = [])
    {
        return self::make()->post($endpoint, $data);
    }

    public static function put($endpoint, $data = [])
    {
        return self::make()->put($endpoint, $data);
    }

    public static function delete($endpoint)
    {
        return self::make()->delete($endpoint);
    }
}
