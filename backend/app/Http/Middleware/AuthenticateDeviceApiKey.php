<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Device;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateDeviceApiKey
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $apiKey = $request->header('X-API-KEY');
        if (!$apiKey) {
            return response()->json(['message' => 'API key missing'], Response::HTTP_UNAUTHORIZED);
        }

        $device = Device::where('api_key', $apiKey)->first();
        if (!$device) {
            return response()->json(['message' => 'Invalid API key'], Response::HTTP_UNAUTHORIZED);
        }

        // Attach device instance to request attributes
        $request->attributes->set('device', $device);
        return $next($request);
    }
}
