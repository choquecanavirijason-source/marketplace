<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private OrderService $orderService)
    {
    }

    public function index(Request $request)
    {
        $orders = $request->user()->orders()->with('items')->latest()->get();

        return OrderResource::collection($orders);
    }

    public function show(Request $request, int $order)
    {
        $order = $request->user()->orders()->with('items')->findOrFail($order);

        return new OrderResource($order);
    }

    public function store(StoreOrderRequest $request)
    {
        $order = $this->orderService->checkout($request->user());

        return new OrderResource($order);
    }
}
