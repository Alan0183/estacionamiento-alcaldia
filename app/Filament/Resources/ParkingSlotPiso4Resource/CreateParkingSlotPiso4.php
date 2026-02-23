<?php

namespace App\Filament\Resources\ParkingSlotPiso4Resource\Pages;

use App\Filament\Resources\ParkingSlotPiso4Resource;
use Filament\Resources\Pages\CreateRecord;

class CreateParkingSlotPiso4 extends CreateRecord
{
    protected static string $resource = ParkingSlotPiso4Resource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['piso'] = 4;
        return $data;
    }
}
