<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Device;
use App\Models\Setting;
use App\Models\Reading;
use App\Models\NotifLog;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DeviceSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@hydromind.local'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
            ]
        );

        $devicesData = [
            ['name' => 'Greenhouse Balkon 1'],
            ['name' => 'Greenhouse Balkon 2'],
        ];

        foreach ($devicesData as $i => $dd) {
            $device = Device::create([
                'name'    => $dd['name'],
                'api_key' => Str::random(40),
            ]);

            Setting::create([
                'device_id'      => $device->id,
                'mode'           => 'AUTO',
                'pump_cmd'       => 'OFF',
                'moisture_lower' => 40,
                'moisture_upper' => 70,
            ]);

            // Create 20 readings per device over last 24 hours
            for ($j = 0; $j < 20; $j++) {
                $minutesAgo = (20 - $j) * 72; // ~24h spread
                $soilMoisture = rand(30, 80) + (rand(0, 9) / 10);
                $batteryLevel = max(10, 90 - ($j * 2) + rand(-5, 5));
                $pumpOn = $soilMoisture < 45;

                Reading::create([
                    'device_id'       => $device->id,
                    'soil_moisture'   => round($soilMoisture, 1),
                    'air_temp'        => round(25 + rand(0, 80) / 10, 1),
                    'air_humidity'    => round(55 + rand(0, 200) / 10, 1),
                    'pump_status'     => $pumpOn ? 'ON' : 'OFF',
                    'water_flow'      => $pumpOn ? round(0.8 + rand(0, 10) / 10, 1) : 0,
                    'battery_level'   => round($batteryLevel, 1),
                    'battery_voltage' => round(9.0 + ($batteryLevel / 100) * 3.6, 1),
                    'created_at'      => Carbon::now()->subMinutes($minutesAgo),
                ]);
            }

            // Add some notifications
            NotifLog::create([
                'device_id'  => $device->id,
                'type'       => 'CLOG_OR_PUMP_FAIL',
                'message'    => 'Pump is ON but no water flow detected — possible clog or pump failure',
                'created_at' => Carbon::now()->subHours(6),
            ]);

            if ($i === 1) {
                NotifLog::create([
                    'device_id'  => $device->id,
                    'type'       => 'LOW_BATTERY',
                    'message'    => 'Battery level below 20% — charge soon',
                    'created_at' => Carbon::now()->subHours(2),
                ]);
            }
        }
    }
}
