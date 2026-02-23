<?php
namespace App\Filament\Resources\ParkingSlotPiso5Resource\Pages;
use App\Filament\Resources\ParkingSlotPiso5Resource;
use Filament\Resources\Pages\CreateRecord;

class CreateParkingSlotPiso5 extends CreateRecord
{
    protected static string $resource = ParkingSlotPiso5Resource::class;
    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['piso'] = 5;
        return $data;
    }
}
