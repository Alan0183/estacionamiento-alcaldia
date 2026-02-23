<?php

use App\Http\Controllers\Api\ParkingController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/parking/slots',       [ParkingController::class, 'index']);
    Route::get('/parking/slots/{id}',  [ParkingController::class, 'show']);
    Route::get('/parking/stats',       [ParkingController::class, 'stats']);
});

// Ruta pública para el mapa (sin auth, o ajusta según tu necesidad)
Route::get('/parking/map-data', [ParkingController::class, 'mapData']);
