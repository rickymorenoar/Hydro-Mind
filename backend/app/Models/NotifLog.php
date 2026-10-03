<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotifLog extends Model
{
    use HasFactory;

    protected $table = 'notif_log';
    public $timestamps = false;

    protected $fillable = [
        'device_id',
        'type',
        'message',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
