<?php

namespace Database\Seeders;

use App\Models\ParkingSlot;
use Illuminate\Database\Seeder;

class ParkingSlotPiso4Seeder extends Seeder
{
    public function run(): void
    {
        // Piso 4 — Prolongación Calle 4 / Canario: cajones 1 al 37
        for ($i = 1; $i <= 37; $i++) {
            ParkingSlot::firstOrCreate(
                ['slot_number' => (string)$i, 'piso' => 4],
                ['estado' => 'libre']
            );
        }

        $this->command->info('✅ Piso 4 (Canario): 37 cajones creados.');
    }
}
