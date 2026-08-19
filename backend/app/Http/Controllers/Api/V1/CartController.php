<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddCartItemRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Http\Resources\CartItemResource;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private CartService $cartService)
    {
    }

    public function index(Request $request)
    {
        return CartItemResource::collection($this->cartService->items($request->user()));
    }

    public function store(AddCartItemRequest $request)
    {
        $product = Product::findOrFail($request->validated('product_id'));

        return CartItemResource::collection($this->cartService->add($request->user(), $product));
    }

    public function update(UpdateCartItemRequest $request, Product $product)
    {
        return CartItemResource::collection(
            $this->cartService->updateQty($request->user(), $product->id, $request->validated('delta'))
        );
    }

    public function destroy(Request $request, Product $product)
    {
        return CartItemResource::collection($this->cartService->remove($request->user(), $product->id));
    }

    public function clear(Request $request)
    {
        return CartItemResource::collection($this->cartService->clear($request->user()));
    }

    public function summary(Request $request)
    {
        $items = $this->cartService->items($request->user());

        return response()->json([
            'count' => $items->sum('qty'),
            'total' => $items->sum(fn ($item) => $item->qty * $item->product->price),
        ]);
    }
}
