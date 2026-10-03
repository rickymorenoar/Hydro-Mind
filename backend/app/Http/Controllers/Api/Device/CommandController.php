<?php

namespace App\Http\Controllers\Api\Device;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Models\Device;

class CommandController extends Controller
{
    /**
     * Return the latest command/settings for the device.
     */
    public function show(): JsonResponse
    {
        $device = request()->attributes->get('device');
        $setting = $device->setting; // hasOne relation
        return response()->json([
            'mode' => $setting->mode,
            'pump_cmd' => $setting->pump_cmd,
            'moisture_lower' => $setting->moisture_lower,
            'moisture_upper' => $setting->moisture_upper,
        ]);
    }
}
