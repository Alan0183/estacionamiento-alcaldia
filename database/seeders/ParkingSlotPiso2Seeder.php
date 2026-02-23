<?php

namespace Database\Seeders;

use App\Models\ParkingSlot;
use Illuminate\Database\Seeder;

class ParkingSlotPiso2Seeder extends Seeder
{
    public function run(): void
    {
        // Todos los cajones del piso 2 según el layout del mapa
        $cajones = [
            // Sección 1 (esquina superior): 335–346
            335,336,337,338,339,340,341,342,343,344,345,346,
            // Sección 2: 309–334
            309,310,311,312,313,314,315,316,317,318,319,320,
            321,322,323,324,325,326,327,328,329,330,331,332,333,334,
            // Sección 3: 283–308
            283,284,285,286,287,288,289,290,291,292,293,294,
            295,296,297,298,299,300,301,302,303,304,305,306,307,308,
            // Sección 4: 251–282 (nota: 257-260 no están en el layout)
            251,252,253,254,255,256,
            261,262,263,264,265,266,267,268,269,270,
            271,272,273,274,275,276,277,278,279,280,281,282,
        ];

        foreach ($cajones as $num) {
            ParkingSlot::firstOrCreate(
                ['slot_number' => (string)$num, 'piso' => 2],
                ['estado' => 'libre']
            );
        }

        $this->command->info('✅ Piso 2: ' . count($cajones) . ' cajones creados.');
    }
}
