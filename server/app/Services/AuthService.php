<?php

namespace App\Services;

use App\Models\User;
use App\Services\Exceptions\BusinessException;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthService
{
    public function login(array $credentials): User
    {
        if (!Auth::attempt($credentials)) {
            throw new BusinessException('Credenciales inválidas', Response::HTTP_UNAUTHORIZED);
        }

        return Auth::user();
    }

    public function register(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'mobile_number' => $data['mobile_number'] ?? null,
            'address' => $data['address'] ?? null,
        ]);

        $user->assignRole('cliente');

        return $user;
    }

    public function updateProfile(User $user, array $data): User
    {
        $user->update($data);

        return $user;
    }

    public function revokeToken(User $user): void
    {
        $user->token()->revoke();
    }

    public function issueToken(User $user): array
    {
        $tokenResult = $user->createToken('PersonalAccessToken');
        $token = $tokenResult->token;
        $token->save();

        return [
            'access_token' => $tokenResult->accessToken,
            'expires_at' => $token->expires_at,
            'user' => $user,
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
        ];
    }
}