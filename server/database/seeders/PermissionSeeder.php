<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'producto' => ['ver', 'crear', 'editar', 'eliminar'],
            'categoria' => ['ver', 'crear', 'editar', 'eliminar'],
            'pedido' => ['ver', 'editar'],
            'usuario' => ['ver', 'editar'],
            'resena' => ['ver', 'eliminar'],
            'testimonio' => ['ver', 'crear', 'editar', 'eliminar'],
            'contacto' => ['ver', 'crear', 'editar', 'eliminar'],
            'pregunta_frecuente' => ['ver', 'crear', 'editar', 'eliminar'],
        ];

        foreach ($permissions as $module => $actions) {
            foreach ($actions as $action) {
                Permission::firstOrCreate([
                    'name' => "$module.$action",
                    'guard_name' => 'api',
                ]);
            }
        }

        $this->command->info('Permissions seeded successfully!');
    }
}