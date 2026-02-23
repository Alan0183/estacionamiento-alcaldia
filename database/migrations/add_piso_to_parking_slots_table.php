<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parking_slots', function (Blueprint $table) {
            // Piso al que pertenece el cajón: 1, 2, 3, 4
            $table->unsignedTinyInteger('piso')->default(1)->after('id');
        });

        // Actualizar todos los registros existentes como piso 1
        DB::table('parking_slots')->update(['piso' => 1]);
    }

    public function down(): void
    {
        Schema::table('parking_slots', function (Blueprint $table) {
            $table->dropColumn('piso');
        });
    }
};
