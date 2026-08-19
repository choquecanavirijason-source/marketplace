<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Eloquent\Collection;

class ReviewService
{
    public function forProduct(Product $product): Collection
    {
        return Review::with('user')
            ->where('product_id', $product->id)
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function submit(Product $product, int $userId, array $data): Review
    {
        $review = Review::updateOrCreate(
            [
                'product_id' => $product->id,
                'user_id' => $userId,
            ],
            [
                'rating' => $data['rating'],
                'comment' => $data['comment'],
                'is_approved' => true,
            ]
        );

        return $review->load('user');
    }

    public function delete(Review $review): void
    {
        $review->delete();
    }
}