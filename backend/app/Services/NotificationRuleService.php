<?php

namespace App\Services;

use App\Models\Device;
use App\Models\NotifLog;
use Carbon\Carbon;

class NotificationRuleService
{
    /**
     * Check reading for pump failure or low battery and create notif logs.
     */
    public function evaluateReading(Device $device, array $reading): void
    {
        // 1. Pump failure detection: pump_status ON but water_flow == 0
        if ($reading['pump_status'] === 'ON' && (float) $reading['water_flow'] == 0.0) {
            $this->createUniqueLog($device, 'CLOG_OR_PUMP_FAIL', 'Pompa aktif tapi tidak ada aliran air terdeteksi — kemungkinan pipa tersumbat atau pompa rusak');
        }

        // 2. Low battery detection: battery_level < 20%
        if ((float) $reading['battery_level'] < 20.0) {
            $this->createUniqueLog($device, 'LOW_BATTERY', 'Tegangan baterai surya di bawah 20% — segera isi daya atau pantau panel surya');
        }
    }

    protected function createUniqueLog(Device $device, string $type, string $message): void
    {
        $recent = NotifLog::where('device_id', $device->id)
            ->where('type', $type)
            ->where('created_at', '>=', Carbon::now()->subMinutes(10))
            ->exists();

        if (!$recent) {
            NotifLog::create([
                'device_id'  => $device->id,
                'type'       => $type,
                'message'    => $message,
                'created_at' => Carbon::now(),
            ]);
        }
    }
}
