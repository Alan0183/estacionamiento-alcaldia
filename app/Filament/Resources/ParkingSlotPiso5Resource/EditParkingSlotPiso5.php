<?php
namespace App\Filament\Resources\ParkingSlotPiso5Resource\Pages;
use App\Filament\Resources\ParkingSlotPiso5Resource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditParkingSlotPiso5 extends EditRecord
{
    protected static string $resource = ParkingSlotPiso5Resource::class;
    protected function getHeaderActions(): array { return [Actions\DeleteAction::make()]; }
}
