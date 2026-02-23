<?php

namespace App\Filament\Resources\ParkingSlotPiso4Resource\Pages;

use App\Filament\Resources\ParkingSlotPiso4Resource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditParkingSlotPiso4 extends EditRecord
{
    protected static string $resource = ParkingSlotPiso4Resource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
