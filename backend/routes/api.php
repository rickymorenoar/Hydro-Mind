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

/*
|--------------------------------------------------------------------------
| Auth routes (public / optional admin authentication)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Device (ESP32) routes – protected by X-API-KEY middleware
|--------------------------------------------------------------------------
*/
Route::middleware('device.auth')->prefix('device')->group(function () {
    Route::post('/data', [DataController::class, 'store']);
    Route::get('/command', [CommandController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| Dashboard REST API routes (Devices, Telemetry, History, Settings)
|--------------------------------------------------------------------------
*/
Route::prefix('dashboard')->group(function () {
    Route::get('/devices', [DeviceController::class, 'index']);
    Route::post('/devices', [DeviceController::class, 'store']);
    Route::get('/devices/{device}/latest', [LatestController::class, 'show']);
    Route::get('/devices/{device}/history', [HistoryController::class, 'index']);
    Route::get('/devices/{device}/notifications', [NotificationController::class, 'index']);
    Route::post('/devices/{device}/settings', [SettingsController::class, 'update']);
});
