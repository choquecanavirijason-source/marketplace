<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\User\UserResource;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class AdminController extends Controller
{
    public function __construct(private readonly AdminService $adminService)
    {
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->adminService->stats(),
        ], Response::HTTP_OK);
    }

    public function users(): JsonResponse
    {
        $users = $this->adminService->users(request()->all());

        return UserResource::collection($users)->response();
    }
}