<?php

namespace App\Services;

use App\Exceptions\EmptyCartException;
use App\Exceptions\InsufficientStockException;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(private CartService $cartService)
    {
    }

    public function checkout(User $user): Order
    {
        $cartItems = $this->cartService->items($user);

        if ($cartItems->isEmpty()) {
            throw new EmptyCartException();
        }

        return DB::transaction(function () use ($user, $cartItems) {
            $subtotal = 0;

            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'confirmed',
                'subtotal' => 0,
                'shipping' => 0,
                'total' => 0,
            ]);

            foreach ($cartItems as $cartItem) {
                $product = Product::query()->lockForUpdate()->findOrFail($cartItem->product_id);

                if (! $product->in_stock) {
                    throw InsufficientStockException::forProduct($product->name);
                }

                $lineSubtotal = $product->price * $cartItem->qty;
                $subtotal += $lineSubtotal;

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_image' => $product->image,
                    'unit_price' => $product->price,
                    'qty' => $cartItem->qty,
                    'subtotal' => $lineSubtotal,
                ]);
            }

            $order->update([
                'subtotal' => $subtotal,
                'shipping' => 0,
                'total' => $subtotal,
            ]);

            $this->cartService->clear($user);

            return $order->load('items');
        });
    }
}
