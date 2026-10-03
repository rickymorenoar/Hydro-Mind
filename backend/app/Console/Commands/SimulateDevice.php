<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Device;
use Illuminate\Support\Facades\Http;

class SimulateDevice extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'simulate:device {apiKey? : The API Key of the device to simulate} {--interval=5 : Interval in seconds between data posts}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Simulate an ESP32 sending sensor readings and fetching commands';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $apiKey = $this->argument('apiKey');

        if (!$apiKey) {
            $device = Device::first();
            if (!$device) {
                $this->error('No device found in database. Run db:seed first.');
                return 1;
            }
            $apiKey = $device->api_key;
            $this->info("Using API key from first device: {$device->name} ($apiKey)");
        }

        $apiUrl = config('app.url', 'http://localhost:8000') . '/api';
        $interval = (int) $this->option('interval');

        $this->info("Starting HydroMind ESP32 simulation for API Key: {$apiKey}");
        $this->info("Posting data to {$apiUrl}/device/data every {$interval}s (Press Ctrl+C to stop)");

        $soilMoisture = 55.0;
        $batteryLevel = 85.0;

        while (true) {
            // 1. Fetch Command from server
            $commandRes = Http::withHeaders(['X-API-KEY' => $apiKey])->get("{$apiUrl}/device/command");
            $commandData = $commandRes->json();
            $mode = $commandData['mode'] ?? 'AUTO';
            $pumpCmd = $commandData['pump_cmd'] ?? 'OFF';
            $moistureLower = $commandData['moisture_lower'] ?? 40;
            $moistureUpper = $commandData['moisture_upper'] ?? 70;

            // 2. Decide pump status
            $pumpStatus = 'OFF';
            if ($mode === 'AUTO') {
                if ($soilMoisture < $moistureLower) {
                    $pumpStatus = 'ON';
                } elseif ($soilMoisture > $moistureUpper) {
                    $pumpStatus = 'OFF';
                }
            } else {
                $pumpStatus = $pumpCmd;
            }

            // 3. Evolve simulation physical values
            if ($pumpStatus === 'ON') {
                $soilMoisture = min(100, $soilMoisture + rand(15, 30) / 10);
                $waterFlow = round(1.0 + rand(0, 5) / 10, 1);
            } else {
                $soilMoisture = max(20, $soilMoisture - rand(5, 15) / 10);
                $waterFlow = 0.0;
            }

            $batteryLevel = max(10, min(100, $batteryLevel + (rand(-5, 5) / 10)));
            $batteryVoltage = round(9.0 + ($batteryLevel / 100) * 3.6, 2);
            $airTemp = round(28.0 + rand(-10, 20) / 10, 1);
            $airHumidity = round(65.0 + rand(-20, 20) / 10, 1);

            // 4. Send payload to server
            $payload = [
                'soil_moisture'   => round($soilMoisture, 1),
                'air_temp'        => $airTemp,
                'air_humidity'    => $airHumidity,
                'pump_status'     => $pumpStatus,
                'water_flow'      => $waterFlow,
                'battery_level'   => round($batteryLevel, 1),
                'battery_voltage' => $batteryVoltage,
            ];

            $res = Http::withHeaders(['X-API-KEY' => $apiKey])->post("{$apiUrl}/device/data", $payload);

            $this->line(sprintf(
                "[%s] Sent: Soil=%.1f%%, Temp=%.1f°C, Hum=%.1f%%, Pump=%s, Flow=%.1fL/m, Batt=%.1f%% (%.2fV) | Resp: %s",
                now()->format('H:i:s'),
                $payload['soil_moisture'],
                $payload['air_temp'],
                $payload['air_humidity'],
                $payload['pump_status'],
                $payload['water_flow'],
                $payload['battery_level'],
                $payload['battery_voltage'],
                $res->status()
            ));

            sleep($interval);
        }

        return 0;
    }
}
