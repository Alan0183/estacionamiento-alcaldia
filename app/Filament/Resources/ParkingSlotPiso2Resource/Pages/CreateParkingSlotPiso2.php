<?php
// app/Filament/Resources/ParkingSlotPiso2Resource/Pages/CreateParkingSlotPiso2.php
namespace App\Filament\Resources\ParkingSlotPiso2Resource\Pages;

use App\Filament\Resources\ParkingSlotPiso2Resource;
use Filament\Resources\Pages\CreateRecord;

class CreateParkingSlotPiso2 extends CreateRecord
{
    protected static string $resource = ParkingSlotPiso2Resource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['piso'] = 2; // Garantiza que siempre se guarda como piso 2
        return $data;
    }
}
