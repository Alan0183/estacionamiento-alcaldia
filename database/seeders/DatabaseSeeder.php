<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario admin inicial
        User::firstOrCreate(
            ['email' => 'admin@parking.com'],
            [
                'name'     => 'Administrador',
                'password' => bcrypt('password'),
                'role'     => 'admin',
            ]
        );

        $this->call(ParkingSlotSeeder::class);
    }
}