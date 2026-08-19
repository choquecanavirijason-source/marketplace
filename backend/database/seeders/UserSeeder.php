<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@ferromax.test'],
            [
                'name' => 'Administrador FerroMax',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'cliente@ferromax.test'],
            [
                'name' => 'Cliente de Prueba',
                'password' => Hash::make('password'),
                'role' => 'customer',
            ]
        );
    }
}
