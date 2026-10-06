<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Http\Resources\DeviceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DeviceController extends Controller
{
    /**
     * List all devices with latest status summary.
     */
    public function index(): JsonResponse
    {
        $devices = Device::with(['setting', 'readings' => function ($q) {
            $q->orderBy('created_at', 'desc')->limit(1);
        }])->get();

        return response()->json(DeviceResource::collection($devices));
    }

    /**
     * Register a new device and create default settings.
     */
    public function store(Request $request): JsonResponse
    {
        $user = auth('sanctum')->user();
        if ($user && $user->role === 'member') {
            return response()->json([
                'message' => 'Akses ditolak: Akun dengan role Member tidak memiliki hak untuk mendaftarkan perangkat baru.'
            ], 403);
        }


        $request->validate([
            'name' => 'required|string|max:255',
        ]);


        $device = Device::create([
            'name'    => $request->input('name'),
            'api_key' => Str::random(40),
        ]);

        $device->setting()->create([
            'mode'           => 'AUTO',
            'pump_cmd'       => 'OFF',
            'moisture_lower' => 40,
            'moisture_upper' => 70,
        ]);

        return response()->json([
            'id'      => $device->id,
            'name'    => $device->name,
            'api_key' => $device->api_key,
        ], 201);
    }
}
