<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParkingSlot extends Model
{
    protected $fillable = [
        'piso',
        'slot_number',
        'nombre',
        'phone',
        'placa',
        'modelo',
        'estado',
        'notas',
    ];

    protected $casts = [
        'piso'  => 'integer',
        'estado'=> 'string',
    ];

    public function scopeLibres($query)     { return $query->where('estado', 'libre'); }
    public function scopeOcupados($query)   { return $query->where('estado', 'ocupado'); }
    public function scopeReservados($query) { return $query->where('estado', 'reservado'); }
    public function scopePiso($query, $piso){ return $query->where('piso', $piso); }
}