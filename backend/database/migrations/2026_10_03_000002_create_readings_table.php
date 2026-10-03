<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->float('soil_moisture');
            $table->float('air_temp');
            $table->float('air_humidity');
            $table->enum('pump_status', ['ON', 'OFF']);
            $table->float('water_flow');
            $table->float('battery_level');
            $table->float('battery_voltage');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['device_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('readings');
    }
};
