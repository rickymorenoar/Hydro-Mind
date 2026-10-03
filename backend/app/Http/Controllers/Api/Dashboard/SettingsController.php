<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingsRequest;
use App\Models\Device;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    public function update(UpdateSettingsRequest $request, Device $device): JsonResponse
    {
        $setting = $device->setting;
        $setting->update($request->validated());

        return response()->json([
            'mode'           => $setting->mode,
            'pump_cmd'       => $setting->pump_cmd,
            'moisture_lower' => $setting->moisture_lower,
            'moisture_upper' => $setting->moisture_upper,
        ]);
    }
}
