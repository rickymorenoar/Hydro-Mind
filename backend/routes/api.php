<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Device\DataController;
use App\Http\Controllers\Api\Device\CommandController;
use App\Http\Controllers\Api\Dashboard\DeviceController;
use App\Http\Controllers\Api\Dashboard\LatestController;
use App\Http\Controllers\Api\Dashboard\HistoryController;
use App\Http\Controllers\Api\Dashboard\NotificationController;
use App\Http\Controllers\Api\Dashboard\SettingsController;
use App\Http\Controllers\Api\Dashboard\UserController;

/*
|--------------------------------------------------------------------------
| Public Authentication Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

/*
|--------------------------------------------------------------------------
| Authenticated User Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin-Only: Manajemen Pengguna
    Route::middleware('role:admin')->prefix('dashboard/users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::delete('/{user}', [UserController::class, 'destroy']);
    });

    // Dashboard REST API Routes (Devices, Telemetry, History, Settings)
    Route::prefix('dashboard')->group(function () {
        // Read-only monitoring (Semua role terautentikasi: Admin, Operator, Member)
        Route::get('/devices', [DeviceController::class, 'index']);
        Route::get('/devices/{device}/latest', [LatestController::class, 'show']);
        Route::get('/devices/{device}/history', [HistoryController::class, 'index']);
        Route::get('/devices/{device}/notifications', [NotificationController::class, 'index']);

        // Registrasi Perangkat baru (Khusus Admin)
        Route::middleware('role:admin')->post('/devices', [DeviceController::class, 'store']);

        // Ubah Pengaturan Ambang & Mode Pompa (Admin & Operator)
        Route::middleware('role:admin,operator')->post('/devices/{device}/settings', [SettingsController::class, 'update']);
    });
});

/*
|--------------------------------------------------------------------------
| Device (ESP32) Routes – Protected by X-API-KEY middleware
|--------------------------------------------------------------------------
*/
Route::middleware('device.auth')->prefix('device')->group(function () {
    Route::post('/data', [DataController::class, 'store']);
    Route::get('/command', [CommandController::class, 'show']);
});

