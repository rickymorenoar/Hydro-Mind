<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReadingResource extends JsonResource
{
    /**
     * Transform the reading into an array matching Table 5.1.
     */
    public function toArray($request): array
    {
        return [
            'soil_moisture'   => $this->soil_moisture,
            'air_temp'        => $this->air_temp,
            'air_humidity'    => $this->air_humidity,
            'pump_status'     => $this->pump_status,
            'water_flow'      => $this->water_flow,
            'battery_level'   => $this->battery_level,
            'battery_voltage' => $this->battery_voltage,
            'created_at'      => $this->created_at,
        ];
    }
}
