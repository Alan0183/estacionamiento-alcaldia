<?php

namespace App\Http\Controllers;

use App\Exports\OcupacionExport;
use App\Models\ParkingSlot;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

class ReporteController extends Controller
{
    private array $nombres = [
        1 => 'Estacionamiento Calle 10',
        2 => 'Estacionamiento Canarios',
        3 => 'Estacionamiento Medio Ambiente',
        4 => 'Estacionamiento Obras',
        5 => 'Estacionamiento Pagaduría',
    ];

    private function getResumen(): array
    {
        $resumen = [];
        for ($piso = 1; $piso <= 5; $piso++) {
            $slots      = ParkingSlot::where('piso', $piso)->get();
            $total      = $slots->count();
            $libres     = $slots->where('estado', 'libre')->count();
            $ocupados   = $slots->where('estado', 'ocupado')->count();
            $reservados = $slots->where('estado', 'reservado')->count();

            $resumen[] = [
                'piso'        => $piso,
                'nombre'      => $this->nombres[$piso] ?? "Piso $piso",
                'total'       => $total,
                'libres'      => $libres,
                'ocupados'    => $ocupados,
                'reservados'  => $reservados,
                'pct_ocupado' => $total > 0 ? round(($ocupados / $total) * 100, 1) : 0,
                'pct_libre'   => $total > 0 ? round(($libres   / $total) * 100, 1) : 0,
            ];
        }
        return $resumen;
    }

    // ── Exportar Excel ────────────────────────────────────────────────
    public function exportarExcel()
    {
        $filename = 'reporte_ocupacion_' . now()->format('Ymd_Hi') . '.xlsx';
        return Excel::download(new OcupacionExport(), $filename);
    }

    // ── Exportar PDF ──────────────────────────────────────────────────
    public function exportarPdf()
    {
        $resumen            = $this->getResumen();
        $global_total       = collect($resumen)->sum('total');
        $global_ocupados    = collect($resumen)->sum('ocupados');
        $global_libres      = collect($resumen)->sum('libres');
        $global_reservados  = collect($resumen)->sum('reservados');

        $data = [
            'resumen'           => $resumen,
            'global_total'      => $global_total,
            'global_ocupados'   => $global_ocupados,
            'global_libres'     => $global_libres,
            'global_reservados' => $global_reservados,
            'global_pct'        => $global_total > 0
                                    ? round(($global_ocupados / $global_total) * 100, 1) : 0,
            'generado_en'       => now()->format('d/m/Y H:i'),
        ];

        $pdf = Pdf::loadView('reportes.ocupacion-pdf', $data)
            ->setPaper('letter', 'landscape');

        return $pdf->download('reporte_ocupacion_' . now()->format('Ymd_Hi') . '.pdf');
    }
}
