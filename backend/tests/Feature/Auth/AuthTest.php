<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_customer_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertCreated()->assertJsonStructure(['user' => ['id', 'name', 'email', 'role'], 'token']);
        $this->assertDatabaseHas('users', ['email' => 'juan@example.com', 'role' => 'customer']);
    }

    public function test_a_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create(['email' => 'juan@example.com']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'juan@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()->assertJsonPath('user.id', $user->id);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create(['email' => 'juan@example.com']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'juan@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertUnprocessable();
    }
}
