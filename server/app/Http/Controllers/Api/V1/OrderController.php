<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\Exceptions\BusinessException;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            $order = $this->orderService->placeOrder($request->user(), $request->validated());
        } catch (BusinessException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], $exception->statusCode);
        }

        return (new OrderResource($order))
            ->additional([
                'success' => true,
                'message' => 'Pedido realizado satisfactoriamente',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function index(Request $request): JsonResponse
    {
        $orders = $this->orderService->myOrders($request->user(), $request->all());

        return OrderResource::collection($orders)->response();
    }

    public function show(Order $order): JsonResponse
    {
        $user = request()->user();
        if ($user->cannot('pedido.ver') && $order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes acceso a este pedido.',
            ], Response::HTTP_FORBIDDEN);
        }

        return (new OrderResource($order->load(['items', 'user'])))
            ->additional(['success' => true])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $orders = $this->orderService->adminOrders($request->all());

        return OrderResource::collection($orders)->response();
    }

    public function updateStatus(Order $order): JsonResponse
    {
        request()->validate([
            'status' => ['required', 'in:' . implode(',', Order::STATUSES)],
        ]);

        $this->orderService->updateStatus($order, request('status'));

        return (new OrderResource($order))
            ->additional([
                'success' => true,
                'message' => 'Estado del pedido actualizado satisfactoriamente',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }
}