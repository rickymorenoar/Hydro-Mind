<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReadingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'soil_moisture'   => $this->input('soil_moisture', 50.0),
            'air_temp'        => $this->input('air_temp', 28.0),
            'air_humidity'    => $this->input('air_humidity', 65.0),
            'pump_status'     => strtoupper($this->input('pump_status', 'OFF')),
            'water_flow'      => $this->input('water_flow', 0.0),
            'battery_level'   => $this->input('battery_level', 100.0),
            'battery_voltage' => $this->input('battery_voltage', 12.0),
        ]);
    }

    public function rules(): array
    {
        return [
            'soil_moisture'   => 'required|numeric|min:0|max:100',
            'air_temp'        => 'required|numeric',
            'air_humidity'    => 'required|numeric|min:0|max:100',
            'pump_status'     => 'required|in:ON,OFF',
            'water_flow'      => 'required|numeric|min:0',
            'battery_level'   => 'required|numeric|min:0|max:100',
            'battery_voltage' => 'required|numeric|min:0',
        ];
    }
}
