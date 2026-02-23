<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('parking_slots', function (Blueprint $table) {
            $table->id();
            $table->string('slot_number')->unique(); // Ej: "1", "26B", "137B"
            $table->string('nombre')->nullable();
            $table->string('phone')->nullable();
            $table->string('placa')->nullable();
            $table->string('modelo')->nullable();
            $table->enum('estado', ['libre', 'ocupado', 'reservado'])->default('libre');
            $table->string('notas')->nullable(); // Para reservados: "CEO", "RRHH", etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parking_slots');
    }
};
