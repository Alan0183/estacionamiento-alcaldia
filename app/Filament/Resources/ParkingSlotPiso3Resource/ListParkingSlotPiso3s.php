<?php
// ─────────────────────────────────────────────────────────────────────
// INSTRUCCIONES: Crear 3 archivos separados dentro de:
// app/Filament/Resources/ParkingSlotPiso3Resource/Pages/
// ─────────────────────────────────────────────────────────────────────

// ── ARCHIVO 1: ListParkingSlotPiso3s.php ─────────────────────────────
namespace App\Filament\Resources\ParkingSlotPiso3Resource\Pages;
use App\Filament\Resources\ParkingSlotPiso3Resource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListParkingSlotPiso3s extends ListRecords
{
    protected static string $resource = ParkingSlotPiso3Resource::class;
    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
