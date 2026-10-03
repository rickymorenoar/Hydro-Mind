<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'mode',
        'pump_cmd',
        'moisture_lower',
        'moisture_upper',
    ];

    protected $casts = [
        'moisture_lower' => 'float',
        'moisture_upper' => 'float',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
