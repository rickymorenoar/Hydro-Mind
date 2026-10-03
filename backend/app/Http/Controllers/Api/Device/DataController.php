<?php

namespace App\Http\Controllers\Api\Device;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReadingRequest;
use App\Models\Device;
use App\Models\Reading;
use App\Services\NotificationRuleService;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DataController extends Controller
{
    public function store(StoreReadingRequest $request): JsonResponse
    {
        /** @var Device $device */
        $device = $request->attributes->get('device');

        $readingData = array_merge($request->validated(), [
            'device_id'  => $device->id,
            'created_at' => Carbon::now(),
        ]);

        $reading = Reading::create($readingData);

        // Run notification evaluation logic
        (new NotificationRuleService())->evaluateReading($device, $reading->toArray());

        return response()->json(['status' => 'ok'], 200);
    }
}
