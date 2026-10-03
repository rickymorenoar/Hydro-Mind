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
            return response()->json(['message' => 'No readings yet'], 404);
        }

        return response()->json([
            'soil_moisture'   => $reading->soil_moisture,
            'air_temp'        => $reading->air_temp,
            'air_humidity'    => $reading->air_humidity,
            'pump_status'     => $reading->pump_status,
            'water_flow'      => $reading->water_flow,
            'battery_level'   => $reading->battery_level,
            'battery_voltage' => $reading->battery_voltage,
            'mode'            => $setting?->mode ?? 'AUTO',
            'created_at'      => $reading->created_at,
        ]);
    }
}
