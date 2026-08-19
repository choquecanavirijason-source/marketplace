<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AssignRolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $roleAdmin = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'api',
        ]);

        $roleClient = Role::firstOrCreate([
            'name' => 'cliente',
            'guard_name' => 'api',
        ]);

        $roleAdmin->syncPermissions(Permission::where('guard_name', 'api')->get());

        $user = User::firstOrCreate(
            ['email' => 'admin@ferromax.com'],
            [
                'name' => 'Administrador FerroMax',
                'first_name' => 'Administrador',
                'last_name' => 'FerroMax',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $user->syncRoles($roleAdmin);

        $this->command->info('Admin role and permissions assigned successfully!');
    }
}