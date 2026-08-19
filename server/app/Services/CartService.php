<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CartService
{
    public function items(User $user): Collection
    {
        return CartItem::with('product.category')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function addItem(User $user, int $productId, int $quantity): CartItem
    {
        $product = Product::active()->findOrFail($productId);

        $item = CartItem::firstOrNew([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $item->quantity = min(($item->quantity ?? 0) + $quantity, 99);
        $item->save();

        return $item->load('product.category');
    }

    public function updateQuantity(CartItem $cartItem, int $quantity): CartItem
    {
        $cartItem->update(['quantity' => $quantity]);

        return $cartItem->load('product.category');
    }

    public function removeItem(CartItem $cartItem): void
    {
        $cartItem->delete();
    }

    public function clear(User $user): void
    {
        CartItem::where('user_id', $user->id)->delete();
    }
}