<?php

namespace App\Filament\Resources\ParkingSlotResource\Pages;

use App\Filament\Resources\ParkingSlotResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditParkingSlot extends EditRecord
{
    protected static string $resource = ParkingSlotResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
