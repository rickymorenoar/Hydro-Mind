<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReadingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
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
