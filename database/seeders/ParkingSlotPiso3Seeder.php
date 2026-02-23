<?php

namespace Database\Seeders;

use App\Models\ParkingSlot;
use Illuminate\Database\Seeder;

class ParkingSlotPiso3Seeder extends Seeder
{
    public function run(): void
    {
        // Piso 3 — Parque de la Juventud: cajones 1 al 10
        for ($i = 1; $i <= 10; $i++) {
            ParkingSlot::firstOrCreate(
                ['slot_number' => (string)$i, 'piso' => 3],
                ['estado' => 'libre']
            );
        }

        $this->command->info('✅ Piso 3 (Parque de la Juventud): 10 cajones creados.');
    }
}
