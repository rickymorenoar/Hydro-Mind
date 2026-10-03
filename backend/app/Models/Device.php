<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'api_key'];

    public function readings()
    {
        return $this->hasMany(Reading::class);
    }

    public function setting()
    {
        return $this->hasOne(Setting::class);
    }

    public function notifLogs()
    {
        return $this->hasMany(NotifLog::class);
    }
}
