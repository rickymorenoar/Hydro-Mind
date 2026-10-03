<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Device;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class HistoryController extends Controller
{
    public function index(Request $request, Device $device): JsonResponse
    {
        $metric = $request->input('metric', 'soil_moisture');
        $range  = $request->input('range', '24h');

        $allowedMetrics = ['soil_moisture', 'battery_voltage'];
        if (!in_array($metric, $allowedMetrics)) {
            return response()->json(['message' => 'Invalid metric'], 422);
        }

        $since = match ($range) {
            '7d'  => Carbon::now()->subDays(7),
            '30d' => Carbon::now()->subDays(30),
            default => Carbon::now()->subHours(24),
        };

        $readings = $device->readings()
            ->where('created_at', '>=', $since)
            ->orderBy('created_at')
            ->get(['created_at', $metric]);

        $data = $readings->map(fn ($r) => [
            'value'      => $r->{$metric},
            'created_at' => $r->created_at,
        ]);

        return response()->json($data);
    }
}
