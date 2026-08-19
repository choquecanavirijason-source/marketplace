<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Review;

class ReviewService
{
    public function add(Product $product, array $data): Review
    {
        $review = $product->reviews()->create($data);

        $this->recalculateRating($product);

        return $review;
    }

    private function recalculateRating(Product $product): void
    {
        $product->update([
            'reviews_count' => $product->reviews()->count(),
            'rating' => round((float) $product->reviews()->avg('rating'), 1),
        ]);
    }
}
