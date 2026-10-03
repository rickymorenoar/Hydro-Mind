<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Device;
use App\Models\Setting;
use App\Models\Reading;
use App\Models\NotifLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

class HydroMindApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_device_data_endpoint_requires_valid_api_key(): void
    {
        $response = $this->postJson('/api/device/data', [
            'soil_moisture' => 50,
            'air_temp' => 28,
            'air_humidity' => 60,
            'pump_status' => 'OFF',
            'water_flow' => 0,
            'battery_level' => 80,
            'battery_voltage' => 11.5,
        ]);

        $response->assertStatus(401);
    }

    public function test_device_can_store_reading_and_fetch_command(): void
    {
        $device = Device::create([
            'name' => 'Greenhouse Test',
            'api_key' => Str::random(40),
        ]);

        Setting::create([
            'device_id' => $device->id,
            'mode' => 'AUTO',
            'pump_cmd' => 'OFF',
            'moisture_lower' => 40,
            'moisture_upper' => 70,
        ]);

        // Send reading
        $response = $this->withHeaders(['X-API-KEY' => $device->api_key])
            ->postJson('/api/device/data', [
                'soil_moisture' => 55.2,
                'air_temp' => 29.4,
                'air_humidity' => 68.1,
                'pump_status' => 'ON',
                'water_flow' => 1.2,
                'battery_level' => 82.0,
                'battery_voltage' => 11.9,
            ]);

        $response->assertStatus(200);
        $response->assertJson(['status' => 'ok']);

        $this->assertDatabaseHas('readings', [
            'device_id' => $device->id,
            'soil_moisture' => 55.2,
        ]);

        // Fetch command
        $cmdResponse = $this->withHeaders(['X-API-KEY' => $device->api_key])
            ->getJson('/api/device/command');

        $cmdResponse->assertStatus(200);
        $cmdResponse->assertJson([
            'mode' => 'AUTO',
            'pump_cmd' => 'OFF',
            'moisture_lower' => 40,
            'moisture_upper' => 70,
        ]);
    }

    public function test_pump_failure_triggers_notification(): void
    {
        $device = Device::create([
            'name' => 'Greenhouse Test Failure',
            'api_key' => Str::random(40),
        ]);

        Setting::create([
            'device_id' => $device->id,
            'mode' => 'MANUAL',
            'pump_cmd' => 'ON',
            'moisture_lower' => 40,
            'moisture_upper' => 70,
        ]);

        // Pump is ON but water_flow is 0 -> Trigger clog/pump failure
        $this->withHeaders(['X-API-KEY' => $device->api_key])
            ->postJson('/api/device/data', [
                'soil_moisture' => 30.0,
                'air_temp' => 30.0,
                'air_humidity' => 50.0,
                'pump_status' => 'ON',
                'water_flow' => 0.0,
                'battery_level' => 75.0,
                'battery_voltage' => 11.5,
            ]);

        $this->assertDatabaseHas('notif_log', [
            'device_id' => $device->id,
            'type' => 'CLOG_OR_PUMP_FAIL',
        ]);
    }
}
