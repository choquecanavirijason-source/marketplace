<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\AuthRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\Auth\AuthResource;
use App\Http\Resources\Auth\MeResource;
use App\Services\AuthService;
use App\Services\Exceptions\BusinessException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function login(AuthRequest $request): JsonResponse | AuthResource
    {
        try {
            $user = $this->authService->login($request->validated());
        } catch (BusinessException $exception) {
            return $this->errorResponse($exception->getMessage(), $exception->statusCode);
        }

        return new AuthResource((object) $this->authService->issueToken($user));
    }

    public function register(RegisterRequest $request): JsonResponse | AuthResource
    {
        $user = $this->authService->register($request->validated());

        return new AuthResource((object) $this->authService->issueToken($user));
    }

    public function updateProfile(UpdateProfileRequest $request): MeResource
    {
        $data = $request->only(['name', 'first_name', 'last_name', 'mobile_number', 'phone_number', 'address']);

        if ($request->filled('password')) {
            $data['password'] = $request->validated('password');
        }

        $user = $this->authService->updateProfile($request->user(), $data);

        return $this->sessionResponse($user->fresh()->load('roles'));
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->revokeToken($request->user());

        return $this->successResponse('Logged out successfully');
    }

    public function me(Request $request)
    {
        return $this->sessionResponse(Auth::user());
    }

    private function sessionResponse($user): MeResource
    {
        return new MeResource((object) [
            'user' => $user,
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
        ]);
    }

    private function successResponse(string $message): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
        ], Response::HTTP_OK);
    }

    private function errorResponse(string $message, int $status): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], $status);
    }
}