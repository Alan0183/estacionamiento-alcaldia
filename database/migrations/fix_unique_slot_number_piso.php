<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parking_slots', function (Blueprint $table) {
            // 1. Eliminar el índice único actual que solo cubría slot_number
            $table->dropUnique(['slot_number']);

            // 2. Crear nuevo índice único compuesto: piso + slot_number
            //    Esto permite que el cajón "1" exista en piso 1, piso 2, piso 3, etc.
            $table->unique(['piso', 'slot_number'], 'parking_slots_piso_slot_unique');
        });
    }

    public function down(): void
    {
        Schema::table('parking_slots', function (Blueprint $table) {
            $table->dropUnique('parking_slots_piso_slot_unique');
            $table->unique('slot_number');
        });
    }
};
