<?php

namespace Database\Seeders;

use App\Models\ParkingSlot;
use Illuminate\Database\Seeder;

class ParkingSlotSeeder extends Seeder
{
    public function run(): void
    {
        // Cajones normales 1–136
        for ($i = 1; $i <= 136; $i++) {
            ParkingSlot::firstOrCreate(
                ['slot_number' => (string)$i],
                ['estado' => 'libre']
            );
        }

        // Cajones con sufijo B
        $bSlots = [128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138,
                   139, 140, 141, 142, 143, 144, 145, 146, 147, 148];
        foreach ($bSlots as $n) {
            ParkingSlot::firstOrCreate(
                ['slot_number' => "{$n}B"],
                ['estado' => 'libre']
            );
        }
    }
}