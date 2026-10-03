<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Device;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function index(Device $device): JsonResponse
    {
        $logs = $device->notifLogs()
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($logs);
    }
}
