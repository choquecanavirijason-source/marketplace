<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Laravel\Passport\Client;
use Laravel\Passport\ClientRepository;

class PassportSeeder extends Seeder
{
    public function run(): void
    {
        $clientRepository = app(ClientRepository::class);

        $exists = Client::query()
            ->whereJsonContains('grant_types', 'personal_access')
            ->exists();

        if (!$exists) {
            $clientRepository->createPersonalAccessGrantClient(
                'FerroMax Personal Access Client',
                config('auth.guards.api.provider', 'users')
            );

            $this->command->info('Personal access client created.');
        }
    }
}