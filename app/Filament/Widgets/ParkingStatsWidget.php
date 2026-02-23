<?php

namespace App\Filament\Widgets;

use App\Models\ParkingSlot;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ParkingStatsWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $total     = ParkingSlot::count();
        $libres    = ParkingSlot::libres()->count();
        $ocupados  = ParkingSlot::ocupados()->count();
        $reservados = ParkingSlot::reservados()->count();

        return [
            Stat::make('Total de Cajones', $total)
                ->icon('heroicon-o-squares-2x2')
                ->color('gray'),

            Stat::make('Libres', $libres)
                ->icon('heroicon-o-check-circle')
                ->color('success'),

            Stat::make('Ocupados', $ocupados)
                ->icon('heroicon-o-x-circle')
                ->color('danger'),

            Stat::make('Reservados', $reservados)
                ->icon('heroicon-o-lock-closed')
                ->color('warning'),
        ];
    }
}