<?php

namespace App\Filament\Resources\ParkingSlotPiso3Resource\Pages;

use App\Filament\Resources\ParkingSlotPiso3Resource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditParkingSlotPiso3 extends EditRecord
{
    protected static string $resource = ParkingSlotPiso3Resource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
