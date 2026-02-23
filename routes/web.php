<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ReporteController;

// Vista del mapa (React)
Route::get('/', function () {
    return Inertia::render('Parking/Index');
});

Route::get('/reportes/ocupacion/excel', [ReporteController::class, 'exportarExcel'])
    ->name('reportes.ocupacion.excel');

Route::get('/reportes/ocupacion/pdf', [ReporteController::class, 'exportarPdf'])
    ->name('reportes.ocupacion.pdf');