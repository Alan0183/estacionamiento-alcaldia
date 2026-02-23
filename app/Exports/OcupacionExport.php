<?php

namespace App\Exports;

use App\Models\ParkingSlot;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Illuminate\Support\Collection;

// ── Hoja de resumen por estacionamiento ──────────────────────────────
class ResumenSheet implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    private array $nombres = [
        1 => 'Estacionamiento Calle 10',
        2 => 'Estacionamiento Canarios',
        3 => 'Estacionamiento Medio Ambiente',
        4 => 'Estacionamiento Obras',
        5 => 'Estacionamiento Pagaduría',
    ];

    public function title(): string { return 'Resumen'; }

    public function headings(): array
    {
        return ['Estacionamiento','Piso','Total','Libres','Ocupados','Reservados','% Ocupación','% Disponible','Estado'];
    }

    public function collection(): Collection
    {
        $rows = collect();
        for ($piso = 1; $piso <= 5; $piso++) {
            $slots      = ParkingSlot::where('piso', $piso)->get();
            $total      = $slots->count();
            $libres     = $slots->where('estado','libre')->count();
            $ocupados   = $slots->where('estado','ocupado')->count();
            $reservados = $slots->where('estado','reservado')->count();
            $pctOcu     = $total > 0 ? round(($ocupados / $total) * 100, 1) : 0;
            $pctLib     = $total > 0 ? round(($libres   / $total) * 100, 1) : 0;
            $estado     = $pctOcu >= 90 ? 'LLENO' : ($pctOcu >= 70 ? 'ALTO' : 'NORMAL');

            $rows->push([
                $this->nombres[$piso] ?? "Piso $piso",
                $piso, $total, $libres, $ocupados, $reservados,
                "$pctOcu%", "$pctLib%", $estado,
            ]);
        }

        // Fila de totales
        $rows->push([
            'TOTAL GLOBAL', '—',
            $rows->sum(fn($r) => $r[2]),
            $rows->sum(fn($r) => $r[3]),
            $rows->sum(fn($r) => $r[4]),
            $rows->sum(fn($r) => $r[5]),
            '', '', '',
        ]);

        return $rows;
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = 7; // 5 pisos + encabezado + totales = 7

        return [
            // Encabezado
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF691C32']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
            // Fila de totales
            $lastRow => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FF691C32']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFFAEAEE']],
            ],
        ];
    }
}

// ── Hoja de detalle cajón por cajón ──────────────────────────────────
class DetalleSheet implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    public function title(): string { return 'Detalle Cajones'; }

    public function headings(): array
    {
        return ['Estacionamiento','Piso','Cajón','Estado','Nombre','Placa','Modelo','Notas','Actualizado'];
    }

    public function collection(): Collection
    {
        $nombres = [
            1 => 'Calle 10', 2 => 'Canarios', 3 => 'Medio Ambiente',
            4 => 'Obras',    5 => 'Pagaduría',
        ];

        return ParkingSlot::orderBy('piso')->orderBy('slot_number')
            ->get()
            ->map(fn($s) => [
                $nombres[$s->piso] ?? "Piso {$s->piso}",
                $s->piso,
                $s->slot_number,
                strtoupper($s->estado),
                $s->nombre   ?? '—',
                $s->placa    ?? '—',
                $s->modelo   ?? '—',
                $s->notas    ?? '—',
                $s->updated_at?->format('d/m/Y H:i') ?? '—',
            ]);
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF691C32']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
        ];
    }
}

// ── Export principal con múltiples hojas ─────────────────────────────
class OcupacionExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            new ResumenSheet(),
            new DetalleSheet(),
        ];
    }
}
