<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    /**
     * Transform the setting into an array.
     */
    public function toArray($request): array
    {
        return [
            'mode' => $this->mode,
            'pump_cmd' => $this->pump_cmd,
            'moisture_lower' => $this->moisture_lower,
            'moisture_upper' => $this->moisture_upper,
        ];
    }
}
