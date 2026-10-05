<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DeviceResource extends JsonResource
{
    public function toArray($request): array
    {
        $latestReading = $this->readings->sortByDesc('created_at')->first();
        return [
            'id' => $this->id,
            'name' => $this->name,
            'api_key_masked' => '••••' . substr($this->api_key, -4),
            'latest_reading' => $latestReading ? (new ReadingResource($latestReading))->toArray($request) : null,
            'setting' => $this->setting ? (new SettingResource($this->setting))->toArray($request) : null,
            'is_online' => $latestReading && $latestReading->created_at && now()->diffInMinutes($latestReading->created_at) < 3,
            'last_seen_diff' => $latestReading && $latestReading->created_at ? $latestReading->created_at->diffForHumans() : null,
            'created_at' => $this->created_at,
        ];
    }
}
