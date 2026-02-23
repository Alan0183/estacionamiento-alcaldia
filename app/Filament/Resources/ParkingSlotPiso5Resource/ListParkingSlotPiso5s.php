<?php
namespace App\Filament\Resources\ParkingSlotPiso5Resource\Pages;
use App\Filament\Resources\ParkingSlotPiso5Resource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListParkingSlotPiso5s extends ListRecords
{
    protected static string $resource = ParkingSlotPiso5Resource::class;
    protected function getHeaderActions(): array { return [Actions\CreateAction::make()]; }
}
