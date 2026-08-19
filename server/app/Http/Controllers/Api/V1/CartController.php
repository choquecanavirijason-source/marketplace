<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\StoreCartItemRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Http\Resources\CartItemResource;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cartService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $items = $this->cartService->items($request->user());

        return CartItemResource::collection($items)
            ->additional(['success' => true])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function store(StoreCartItemRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $item = $this->cartService->addItem(
            $request->user(),
            (int) $validated['product_id'],
            (int) $validated['quantity']
        );

        return (new CartItemResource($item))
            ->additional([
                'success' => true,
                'message' => 'Producto agregado al carrito',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem): JsonResponse
    {
        if ($cartItem->user_id !== $request->user()->id) {
            return $this->forbiddenResponse();
        }

        $item = $this->cartService->updateQuantity($cartItem, (int) $request->validated('quantity'));

        return (new CartItemResource($item))
            ->additional([
                'success' => true,
                'message' => 'Cantidad actualizada',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function destroy(Request $request, CartItem $cartItem): JsonResponse
    {
        if ($cartItem->user_id !== $request->user()->id) {
            return $this->forbiddenResponse();
        }

        $this->cartService->removeItem($cartItem);

        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado del carrito',
        ], Response::HTTP_OK);
    }

    public function clear(Request $request): JsonResponse
    {
        $this->cartService->clear($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Carrito vaciado',
        ], Response::HTTP_OK);
    }

    private function forbiddenResponse(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'No tienes acceso a este ítem del carrito.',
        ], Response::HTTP_FORBIDDEN);
    }
}