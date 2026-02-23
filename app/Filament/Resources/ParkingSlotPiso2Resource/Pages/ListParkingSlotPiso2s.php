<?php
// app/Filament/Resources/ParkingSlotPiso2Resource/Pages/ListParkingSlotPiso2s.php
namespace App\Filament\Resources\ParkingSlotPiso2Resource\Pages;

use App\Filament\Resources\ParkingSlotPiso2Resource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListParkingSlotPiso2s extends ListRecords
{
    protected static string $resource = ParkingSlotPiso2Resource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
