<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParkingSlot;
use Illuminate\Http\JsonResponse;

class ParkingController extends Controller
{
    /**
     * GET /api/parking/map-data?piso=1  (default piso=1)
     * GET /api/parking/map-data?piso=2
     */
    public function mapData(): JsonResponse
    {
        $piso = request()->integer('piso', 1);

        $result = [];
        ParkingSlot::where('piso', $piso)->get()->each(function ($slot) use (&$result) {
            $result[$slot->slot_number] = [
                'slot_number' => $slot->slot_number,
                'nombre'      => $slot->nombre,
                'phone'       => $slot->phone,
                'placa'       => $slot->placa,
                'modelo'      => $slot->modelo,
                'estado'      => $slot->estado,
                'notas'       => $slot->notas,
                'piso'        => $slot->piso,
            ];
        });

        return response()->json($result);
    }

    /**
     * GET /api/parking/stats?piso=1
     */
    public function stats(): JsonResponse
    {
        $piso = request()->integer('piso', 1);
        $base = ParkingSlot::where('piso', $piso);

        return response()->json([
            'piso'       => $piso,
            'total'      => (clone $base)->count(),
            'libres'     => (clone $base)->where('estado', 'libre')->count(),
            'ocupados'   => (clone $base)->where('estado', 'ocupado')->count(),
            'reservados' => (clone $base)->where('estado', 'reservado')->count(),
        ]);
    }

    public function index(): JsonResponse
    {
        return response()->json(
            ParkingSlot::orderBy('piso')->orderBy('slot_number')->get()
        );
    }
}