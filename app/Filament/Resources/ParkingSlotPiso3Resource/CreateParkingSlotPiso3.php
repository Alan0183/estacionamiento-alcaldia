<?php

namespace App\Filament\Resources\ParkingSlotPiso3Resource\Pages;

use App\Filament\Resources\ParkingSlotPiso3Resource;
use Filament\Resources\Pages\CreateRecord;

class CreateParkingSlotPiso3 extends CreateRecord
{
    protected static string $resource = ParkingSlotPiso3Resource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['piso'] = 3;
        return $data;
    }
}
