<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reading extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'device_id',
        'soil_moisture',
        'air_temp',
        'air_humidity',
        'pump_status',
        'water_flow',
        'battery_level',
        'battery_voltage',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'soil_moisture' => 'float',
        'air_temp' => 'float',
        'air_humidity' => 'float',
        'water_flow' => 'float',
        'battery_level' => 'float',
        'battery_voltage' => 'float',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
