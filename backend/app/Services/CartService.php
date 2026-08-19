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
        return $user->cartItems()->with('product.category')->latest()->get();
    }

    public function add(User $user, Product $product): Collection
    {
        $item = CartItem::query()->firstOrNew([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $item->qty = ($item->exists ? $item->qty : 0) + 1;
        $item->save();

        return $this->items($user);
    }

    public function remove(User $user, int $productId): Collection
    {
        $user->cartItems()->where('product_id', $productId)->delete();

        return $this->items($user);
    }

    public function updateQty(User $user, int $productId, int $delta): Collection
    {
        $item = $user->cartItems()->where('product_id', $productId)->first();

        if ($item) {
            $newQty = $item->qty + $delta;

            if ($newQty <= 0) {
                $item->delete();
            } else {
                $item->update(['qty' => $newQty]);
            }
        }

        return $this->items($user);
    }

    public function clear(User $user): Collection
    {
        $user->cartItems()->delete();

        return $this->items($user);
    }
}
