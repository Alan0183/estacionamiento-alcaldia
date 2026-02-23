<?php

namespace App\Filament\Resources\ParkingSlotPiso4Resource\Pages;

use App\Filament\Resources\ParkingSlotPiso4Resource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListParkingSlotPiso4s extends ListRecords
{
    protected static string $resource = ParkingSlotPiso4Resource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
