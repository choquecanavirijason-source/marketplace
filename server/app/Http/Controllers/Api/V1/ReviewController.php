<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviewService)
    {
    }

    public function byProduct(Product $product): JsonResponse
    {
        $reviews = $this->reviewService->forProduct($product);

        return (ReviewResource::collection($reviews))
            ->additional(['success' => true])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function store(StoreReviewRequest $request, Product $product): JsonResponse
    {
        $review = $this->reviewService->submit(
            $product,
            $request->user()->id,
            $request->validated()
        );

        return (new ReviewResource($review))
            ->additional([
                'success' => true,
                'message' => 'Reseña publicada satisfactoriamente',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function destroy(Review $review): JsonResponse
    {
        $this->reviewService->delete($review);

        return response()->json([
            'success' => true,
            'message' => 'Reseña eliminada satisfactoriamente',
        ], Response::HTTP_OK);
    }
}