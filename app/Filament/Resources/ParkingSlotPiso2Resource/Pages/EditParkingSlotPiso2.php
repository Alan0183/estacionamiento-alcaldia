<?php
// app/Filament/Resources/ParkingSlotPiso2Resource/Pages/EditParkingSlotPiso2.php
namespace App\Filament\Resources\ParkingSlotPiso2Resource\Pages;

use App\Filament\Resources\ParkingSlotPiso2Resource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditParkingSlotPiso2 extends EditRecord
{
    protected static string $resource = ParkingSlotPiso2Resource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
