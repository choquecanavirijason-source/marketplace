<?php

namespace App\Services;

use App\Models\Favorite;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class FavoriteService
{
    public function items(User $user): Collection
    {
        return Product::query()
            ->whereIn('id', $user->favorites()->pluck('product_id'))
            ->with('category')
            ->get();
    }

    public function toggle(User $user, Product $product): Collection
    {
        $favorite = Favorite::query()->where([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        if ($favorite->exists()) {
            $favorite->delete();
        } else {
            Favorite::create(['user_id' => $user->id, 'product_id' => $product->id]);
        }

        return $this->items($user);
    }

    public function remove(User $user, int $productId): Collection
    {
        $user->favorites()->where('product_id', $productId)->delete();

        return $this->items($user);
    }
}
