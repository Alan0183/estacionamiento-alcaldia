<?php

namespace App\Filament\Pages;

use App\Models\ParkingSlot;
use Filament\Pages\Page;
use Filament\Actions\Action;
use Illuminate\Support\Facades\DB;

class ReporteOcupacion extends Page
{
    protected static ?string $navigationIcon  = 'heroicon-o-chart-bar';
    protected static ?string $navigationLabel = 'Reporte de Ocupación';
    protected static ?string $title           = 'Reporte de Ocupación';
    protected static ?int    $navigationSort  = 10;
    protected static string  $view            = 'filament.pages.reporte-ocupacion';

    // ── Datos que se pasan a la vista ────────────────────────────────
    public function getViewData(): array
    {
        $nombres = [
            1 => 'Estacionamiento Calle 10',
            2 => 'Estacionamiento Canarios',
            3 => 'Estacionamiento Medio Ambiente',
            4 => 'Estacionamiento Obras',
            5 => 'Estacionamiento Pagaduría',
        ];

        $resumen = [];
        for ($piso = 1; $piso <= 5; $piso++) {
            $slots = ParkingSlot::where('piso', $piso)->get();
            $total     = $slots->count();
            $libres    = $slots->where('estado', 'libre')->count();
            $ocupados  = $slots->where('estado', 'ocupado')->count();
            $reservados= $slots->where('estado', 'reservado')->count();

            $resumen[] = [
                'piso'        => $piso,
                'nombre'      => $nombres[$piso] ?? "Piso $piso",
                'total'       => $total,
                'libres'      => $libres,
                'ocupados'    => $ocupados,
                'reservados'  => $reservados,
                'pct_ocupado' => $total > 0 ? round(($ocupados / $total) * 100, 1) : 0,
                'pct_libre'   => $total > 0 ? round(($libres   / $total) * 100, 1) : 0,
            ];
        }

        $global_total     = collect($resumen)->sum('total');
        $global_ocupados  = collect($resumen)->sum('ocupados');
        $global_libres    = collect($resumen)->sum('libres');
        $global_reservados= collect($resumen)->sum('reservados');

        return [
            'resumen'           => $resumen,
            'global_total'      => $global_total,
            'global_ocupados'   => $global_ocupados,
            'global_libres'     => $global_libres,
            'global_reservados' => $global_reservados,
            'global_pct'        => $global_total > 0
                                    ? round(($global_ocupados / $global_total) * 100, 1)
                                    : 0,
            'generado_en'       => now()->format('d/m/Y H:i'),
        ];
    }

    // ── Acciones del header (exportar) ───────────────────────────────
    protected function getHeaderActions(): array
    {
        return [
            Action::make('exportar_excel')
                ->label('Exportar Excel')
                ->icon('heroicon-o-table-cells')
                ->color('success')
                ->url(route('reportes.ocupacion.excel'))
                ->openUrlInNewTab(),

            Action::make('exportar_pdf')
                ->label('Exportar PDF')
                ->icon('heroicon-o-document-arrow-down')
                ->color('danger')
                ->url(route('reportes.ocupacion.pdf'))
                ->openUrlInNewTab(),
        ];
    }
}
