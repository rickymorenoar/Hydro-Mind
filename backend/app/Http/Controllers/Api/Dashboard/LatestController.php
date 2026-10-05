<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Device;
use Illuminate\Http\JsonResponse;

class LatestController extends Controller
{
    public function show(Device $device): JsonResponse
    {
        $reading = $device->readings()->latest('created_at')->first();
        $setting = $device->setting;

        if (!$reading) {
            return response()->json([
                'soil_moisture'   => null,
                'air_temp'        => null,
                'air_humidity'    => null,
                'pump_status'     => 'OFF',
                'water_flow'      => 0.0,
                'battery_level'   => null,
                'battery_voltage' => null,
                'mode'            => $setting?->mode ?? 'AUTO',
                'is_online'       => false,
                'last_seen_diff'  => null,
                'created_at'      => null,
                'has_data'        => false,
            ], 200);
        }

        $isOnline = $reading->created_at ? now()->diffInMinutes($reading->created_at) < 3 : false;

        return response()->json([
            'soil_moisture'   => $reading->soil_moisture,
            'air_temp'        => $reading->air_temp,
            'air_humidity'    => $reading->air_humidity,
            'pump_status'     => $reading->pump_status,
            'water_flow'      => $reading->water_flow,
            'battery_level'   => $reading->battery_level,
            'battery_voltage' => $reading->battery_voltage,
            'mode'            => $setting?->mode ?? 'AUTO',
            'is_online'       => $isOnline,
            'last_seen_diff'  => $reading->created_at ? $reading->created_at->diffForHumans() : null,
            'created_at'      => $reading->created_at,
        ]);
    }
}
