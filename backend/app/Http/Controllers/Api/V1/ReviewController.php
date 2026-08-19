<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Services\ReviewService;

class ReviewController extends Controller
{
    public function __construct(private ReviewService $reviewService)
    {
    }

    public function index(Product $product)
    {
        return ReviewResource::collection($product->reviews()->latest()->get());
    }

    public function summary(Product $product)
    {
        return response()->json([
            'average' => (float) $product->rating,
            'total' => $product->reviews_count,
            'breakdown' => $product->reviews()
                ->selectRaw('rating, count(*) as total')
                ->groupBy('rating')
                ->pluck('total', 'rating'),
        ]);
    }

    public function store(StoreReviewRequest $request, Product $product)
    {
        $review = $this->reviewService->add($product, $request->validated());

        return new ReviewResource($review);
    }
}
