<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('mode', ['AUTO', 'MANUAL'])->default('AUTO');
            $table->enum('pump_cmd', ['ON', 'OFF'])->default('OFF');
            $table->float('moisture_lower')->default(40);
            $table->float('moisture_upper')->default(70);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
