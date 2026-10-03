<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Auth via Sanctum, already verified
        return true;
    }

    public function rules(): array
    {
        return [
            'mode' => 'sometimes|in:AUTO,MANUAL',
            'pump_cmd' => 'sometimes|in:ON,OFF',
            'moisture_lower' => 'sometimes|numeric|min:0|max:100',
            'moisture_upper' => 'sometimes|numeric|min:0|max:100',
        ];
    }
}
